"use server";

import { ChompResult } from "@prisma/client";
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
import pRetry from "p-retry";

import { getJwtPayload } from "../actions/jwt";
import { HIGH_PRIORITY_FEE } from "../constants/fee";
import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
import { getRecentPrioritizationFees } from "../queries/getPriorityFeeEstimate";
import { getBonkBalance, getSolBalance } from "../utils/solana";
import { CONNECTION } from "./solana";

export const sendBonk = async (
  toWallet: PublicKey,
  amount: number,
  chompResults?: ChompResult[],
  questionIds?: number[],
) => {
  const payload = await getJwtPayload();

  if (!payload) return null;
  const fromWallet = Keypair.fromSecretKey(
    base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY || ""),
  );

  const treasuryAddress = fromWallet.publicKey.toString();

  const treasurySolBalance = await getSolBalance(treasuryAddress);
  const treasuryBonkBalance = await getBonkBalance(treasuryAddress);

  const minTreasurySolBalance = parseFloat(
    process.env.MIN_TREASURY_SOL_BALANCE || "0.01",
  );
  const minTreasuryBonkBalance = parseFloat(
    process.env.MIN_TREASURY_BONK_BALANCE || "1000000",
  );

  if (
    treasurySolBalance < minTreasurySolBalance ||
    // getBonkBalance returns 0 for RPC errors, so we don't trigger Sentry if low balance is just RPC failure
    (treasuryBonkBalance < minTreasuryBonkBalance && treasuryBonkBalance > 0)
  ) {
    Sentry.captureMessage(
      `Treasury balance low: ${treasurySolBalance} SOL, ${treasuryBonkBalance} BONK. Squads: https://v4.squads.so/squads/${process.env.CHOMP_SQUADS}/home , Solscan: https://solscan.io/account/${treasuryAddress}#transfers`,
      {
        level: "fatal",
        tags: {
          category: "treasury-low-alert", // Custom tag to catch on Sentry
        },
        extra: {
          treasurySolBalance,
          treasuryBonkBalance,
          Refill: treasuryAddress,
          Squads: `https://v4.squads.so/squads/${process.env.CHOMP_SQUADS}/home`,
          Solscan: `https://solscan.io/account/${treasuryAddress}#transfers `,
        },
      },
    );
  }

  const bonkMint = new PublicKey(process.env.NEXT_PUBLIC_BONK_ADDRESS!);

  const treasuryAssociatedAddress = await getAssociatedTokenAddress(
    bonkMint,
    fromWallet.publicKey,
  );

  const receiverAssociatedAddress = await getAssociatedTokenAddress(
    bonkMint,
    toWallet,
  );

  const receiverAccountInfo = await CONNECTION.getAccountInfo(
    receiverAssociatedAddress,
  );

  const instructions = [];

  // If token mint account doesn't exist for the user create a mint account
  if (!receiverAccountInfo) {
    const ataInstruction = createAssociatedTokenAccountInstruction(
      fromWallet.publicKey,
      receiverAssociatedAddress,
      toWallet,
      bonkMint,
    );
    instructions.push(ataInstruction);
  }

  const transferInstruction = createTransferInstruction(
    treasuryAssociatedAddress,
    receiverAssociatedAddress,
    fromWallet.publicKey,
    amount,
  );

  instructions.push(transferInstruction);

  let blockhashResponse = await CONNECTION.getLatestBlockhash("confirmed");

  const v0message = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: blockhashResponse.blockhash,
    instructions,
  }).compileToV0Message();

  const versionedTransaction = new VersionedTransaction(v0message);

  versionedTransaction.sign([fromWallet]);

  const estimateFee = await getRecentPrioritizationFees(versionedTransaction);

  // Add the compute unit price instruction with the estimated fee
  const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: Math.round(
      estimateFee?.result?.priorityFeeLevels?.high || HIGH_PRIORITY_FEE,
    ),
  });

  // update the instructions with compute budget instruction.
  instructions.unshift(computeBudgetIx);

  blockhashResponse = await CONNECTION.getLatestBlockhash("finalized");

  const v0updatedMessage = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: blockhashResponse.blockhash,
    instructions,
  }).compileToV0Message();

  const updatedVersionedTransaction = new VersionedTransaction(
    v0updatedMessage,
  );

  updatedVersionedTransaction.sign([fromWallet]);

  const signature = await CONNECTION.sendTransaction(
    updatedVersionedTransaction,
    {
      maxRetries: 10,
    },
  );

  try {
    await pRetry(
      async () => {
        const currentBlockhash = await CONNECTION.getLatestBlockhash();
        await CONNECTION.confirmTransaction(
          {
            signature,
            ...currentBlockhash,
          },
          "confirmed",
        );
      },
      {
        retries: 1,
        onFailedAttempt: (error) => {
          console.log(
            `Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`,
          );
        },
      },
    );
  } catch {
    Sentry.captureException(
      `User with id: ${payload?.sub} is having trouble claiming question IDs: ${questionIds} with transaction confirmation`,
      {
        level: "fatal",
        tags: {
          category: "claim-tx-confirmation-error",
        },
        extra: {
          chompResults: chompResults?.map((r) => r.id),
          transactionHash: signature,
        },
      },
    );
  }
  await Sentry.flush(SENTRY_FLUSH_WAIT);

  return signature;
};
