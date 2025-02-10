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
import "server-only";

import { getJwtPayload } from "../actions/jwt";
import { HIGH_PRIORITY_FEE } from "../constants/fee";
import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
import { getRecentPrioritizationFees } from "../queries/getPriorityFeeEstimate";
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

  if (!!receiverAccountInfo) {
    // based on historical transaction cost
    // eg https://solscan.io/tx/3jGXyvQ3hwfLWC4ABijJQhYQ8YK6duDXGqijmQEuPJ3RSsGYxjHX7G4aPZ1oVDmuVscxEQj2qamt7igsja4Gjgkn
    const computeUnitFix = 4994;

    // Buffer to make sure the transaction doesn't fail because of insufficient compute units
    const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: Math.round(computeUnitFix * 1.1),
    });

    // update the instructions with compute unit instruction (unshift will move compute unit to the start and it is recommended in docs as well.)
    instructions.unshift(computeUnitsIx);
  } else {
    // based on recent ATA creation CU consumption
    // https://solscan.io/tx/37aEx5VpNMLXrKrMYPoGFbUmhg2YBGgvR3azHY17mWk1uupve229jhdyJWxA3HHAuJq8mtmeQBSR7dkuvhnVYbgs
    const computeUnitFix = 27695;

    // Buffer to compensate any additional usage
    const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: Math.round(computeUnitFix * 1.05),
    });

    instructions.unshift(computeUnitsIx);
  }

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
