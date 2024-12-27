"use server";

import * as Sentry from "@sentry/nextjs";
import {
  TOKEN_PROGRAM_ID,
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

import { getJwtPayload } from "../actions/jwt";
import { HIGH_PRIORITY_FEE } from "../constants/fee";
import { getRecentPrioritizationFees } from "../queries/getPriorityFeeEstimate";
import { getBonkBalance, getSolBalance } from "../utils/solana";
import { CONNECTION } from "./solana";

export const sendBonk = async (toWallet: PublicKey, amount: number) => {
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

  const treasuryATA = await getAssociatedTokenAddress(
    bonkMint,
    fromWallet.publicKey,
  );

  const receiverATA = await getAssociatedTokenAddress(bonkMint, toWallet);

  const receiverAccountInfo = await CONNECTION.getAccountInfo(receiverATA);

  const instructions = [];

  // If token mint account doesn't exist for the user create a mint account
  if (!receiverAccountInfo) {
    const ataInstruction = createAssociatedTokenAccountInstruction(
      fromWallet.publicKey,
      receiverATA,
      toWallet,
      bonkMint,
    );
    instructions.push(ataInstruction);
  }

  const transferInstruction = createTransferInstruction(
    treasuryATA,
    receiverATA,
    fromWallet.publicKey,
    amount,
    [],
    TOKEN_PROGRAM_ID,
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

  //refered from past transaction
  // const computeUnitFix = 4794;
  // // Buffer to make sure the transaction doesn't fail because of less compute units
  // const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
  //   units: Math.round(computeUnitFix * 1.1),
  // });

  // update the instructions with compute unit instruction (unshift will move compute unit to the start and it is recommended in docs as well.)
  // instructions.unshift(computeUnitsIx);

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
  return signature;
};
