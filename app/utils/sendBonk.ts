import {
  TransactionFailedError,
  TransactionFailedToConfirmError,
} from "@/lib/error";
import { EChainTxType } from "@prisma/client";
import { EChainTxStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import base58 from "bs58";
import "server-only";

import { getJwtPayload } from "../actions/jwt";
import { HIGH_PRIORITY_FEE } from "../constants/fee";
import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
import { getRecentPrioritizationFees } from "../queries/getPriorityFeeEstimate";
import prisma from "../services/prisma";
import { checkTransactionStatus } from "./checkTransactionStatus";
import { sleep } from "./sleep";
import { CONNECTION } from "./solana";

/**

Send Bonk to a wallet
@warning 🚨 DO NOT USE THIS METHOD DIRECTLY - Use sendBonkFromTreasury instead which implements rate limiting
@param toWallet - The recipient wallet address
@param amount - The amount of Bonk to send
@param type - The trigger type of the transaction
@returns The signature of the transaction or null if the transaction fails
*/
export const sendBonk = async (
  toWallet: PublicKey,
  amount: number,
  type: EChainTxType,
) => {
  const payload = await getJwtPayload();

  if (!payload) return null;

  const rawAmount = Math.round(amount * 10 ** 5);

  const fromWallet = Keypair.fromSecretKey(
    base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY || ""),
  );

  const bonkMint = new PublicKey(process.env.NEXT_PUBLIC_BONK_ADDRESS!);

  // Get the associated token address for the treasury wallet
  const treasuryAssociatedAddress = await getAssociatedTokenAddress(
    bonkMint,
    fromWallet.publicKey,
  );

  // Get the associated token address for the receiver wallet
  const receiverAssociatedAddress = await getAssociatedTokenAddress(
    bonkMint,
    toWallet,
  );

  const receiverAccountInfo = await CONNECTION.getAccountInfo(
    receiverAssociatedAddress,
  );

  // Simulate the transaction to estimate fees
  const simulateTransactionInstructions = [
    createTransferInstruction(
      treasuryAssociatedAddress,
      receiverAssociatedAddress,
      fromWallet.publicKey,
      rawAmount,
    ),
  ];

  // If the receiver doesn't have an ATA, add one more instruction to create ATA
  if (!receiverAccountInfo) {
    simulateTransactionInstructions.unshift(
      createAssociatedTokenAccountInstruction(
        fromWallet.publicKey,
        receiverAssociatedAddress,
        toWallet,
        bonkMint,
      ),
    );
  }

  const latestBlockhash = await CONNECTION.getLatestBlockhash("finalized");
  const simulateTransactionMessage = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: simulateTransactionInstructions,
  }).compileToV0Message();

  const simulateTransaction = new VersionedTransaction(
    simulateTransactionMessage,
  );
  simulateTransaction.sign([fromWallet]);

  // Determine the priority fee to use
  const priorityFee = await getRecentPrioritizationFees(simulateTransaction);
  const microLamports = Math.round(
    priorityFee?.result?.priorityFeeLevels?.high || HIGH_PRIORITY_FEE,
  );

  // Prepare the actual instructions
  const instructions = [];

  // Add compute budget instructions first
  // 1. Set compute unit price (priority fee)
  const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports,
  });
  instructions.push(computeBudgetIx);

  // 2. Set compute unit limit based on whether we need to create an ATA
  if (!receiverAccountInfo) {
    // Based on latest tx: https://solscan.io/tx/3q2sg2mqD9ZCy1ELSQAEr3biArVGRNthBcWJcCEqsoKrj73CeSMGA9sB6wpjBoY3VDhNfSAYzgUgsHGSpEHfFrbR
    const computeUnitFix = Math.ceil(32852 * 1.3); // 30% buffer to address budget issues
    const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: computeUnitFix,
    });
    instructions.push(computeUnitsIx);

    // 3. Add ATA creation instruction
    const ataInstruction = createAssociatedTokenAccountInstruction(
      fromWallet.publicKey,
      receiverAssociatedAddress,
      toWallet,
      bonkMint,
    );
    instructions.push(ataInstruction);
  } else {
    // Based on latest tx: https://solscan.io/tx/4kcpQ4NEjbfyiLK9HR6jMPmHtXDTGTGz1Yz6xdHcBpxnoArajFtGEhFfDkEFFtFK8vK5UJrMqGnpG7EnTM3dFNsK
    const computeUnitFix = Math.ceil(4944 * 1.3); // 30% buffer to address budget issues
    const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: computeUnitFix,
    });
    instructions.push(computeUnitsIx);
  }

  // 4. Add transfer instruction
  const transferInstruction = createTransferInstruction(
    treasuryAssociatedAddress,
    receiverAssociatedAddress,
    fromWallet.publicKey,
    rawAmount,
  );
  instructions.push(transferInstruction);

  // Get latest blockhash
  const blockhashResponse = await CONNECTION.getLatestBlockhash("finalized");

  // Create transaction message with all instructions
  const v0message = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: blockhashResponse.blockhash,
    instructions,
  }).compileToV0Message();

  // Create and sign the transaction
  const versionedTransaction = new VersionedTransaction(v0message);
  versionedTransaction.sign([fromWallet]);

  await prisma.chainTx.create({
    data: {
      hash: base58.encode(versionedTransaction.signatures[0]),
      status: EChainTxStatus.New,
      solAmount: "0",
      wallet: fromWallet.publicKey.toBase58(),
      recipientAddress: toWallet.toBase58(),
      type: type,
      tokenAmount: amount.toString(),
      tokenAddress: bonkMint.toBase58(),
    },
  });

  // Send the transaction
  let signature: string | null = null;

  try {
    signature = await CONNECTION.sendTransaction(versionedTransaction, {
      maxRetries: 10,
    });
  } catch (error) {
    const transactionFailedError = new TransactionFailedError(
      "Failed to send Bonk Transaction",
      { cause: error },
    );
    Sentry.captureException(transactionFailedError, {
      extra: {
        errorPhase: "SEND_TRANSACTION_FAILED",
        errorDetails: error instanceof Error ? error.message : String(error),
        userId: payload?.sub,
        walletAddress: toWallet.toBase58(),
        transactionType: !receiverAccountInfo
          ? "with_ata_creation"
          : "transfer_only",
        amount,
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);
  }

  // Wait for 2 seconds to ensure the transaction is processed before confirming
  await sleep(2000);

  try {
    if (!signature) {
      throw new Error("Transaction signature is null");
    }
    const isConfirmed = await checkTransactionStatus(signature);

    if (isConfirmed) {
      await prisma.chainTx.update({
        where: { hash: signature },
        data: { status: EChainTxStatus.Finalized, finalizedAt: new Date() },
      });
    }
  } catch (error) {
    const transactionFailedToConfirm = new TransactionFailedToConfirmError(
      `Failed to confirm Bonk Transaction`,
      {
        cause: error,
      },
    );

    Sentry.captureException(transactionFailedToConfirm, {
      extra: {
        errorPhase: "TRANSACTION_CONFIRMATION_FAILED",
        errorDetails: error,
        userId: payload?.sub,
        walletAddress: toWallet.toBase58(),
        signature,
        transactionType: !receiverAccountInfo
          ? "with_ata_creation"
          : "transfer_only",
        amount,
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);
  }

  return signature;
};
