"use server";

import { ChompResult } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
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

export class BonkTransactionError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BonkTransactionError";
  }
}

export class InsufficientFundsError extends BonkTransactionError {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, cause);
    this.name = "InsufficientFundsError";
  }
}

export class TokenAccountError extends BonkTransactionError {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, cause);
    this.name = "TokenAccountError";
  }
}

/**
 * Gets or creates an associated token account for the destination wallet
 * @param connection - The Solana connection instance
 * @param fromWallet - The wallet that will pay for account creation (usually treasury)
 * @param bonkMint - The BONK token mint public key
 * @param toWalletPubkey - The destination wallet's public key
 * @returns The associated token account info
 * @throws {Error} If account creation fails or there are insufficient funds
 */
export async function getDestinationSplAccount(
  connection: Connection,
  fromWallet: Keypair,
  bonkMint: PublicKey,
  toWalletPubkey: PublicKey,
) {
  try {
    return await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      bonkMint,
      toWalletPubkey,
    );
  } catch (error: any) {
    // Check for specific error types
    if (error.message?.includes("insufficient funds")) {
      const insufficientFundsError = new InsufficientFundsError(
        `Insufficient funds to create token account for ${toWalletPubkey.toString()}`,
        error,
      );
      Sentry.captureException(insufficientFundsError, {
        level: "error",
        tags: {
          category: "token-account-creation-error",
          errorType: "insufficient-funds",
        },
        extra: {
          fromWallet: fromWallet.publicKey.toString(),
          toWallet: toWalletPubkey.toString(),
          bonkMint: bonkMint.toString(),
        },
      });
      throw insufficientFundsError;
    }

    // Handle invalid account data errors
    if (error.message?.includes("invalid account data")) {
      const tokenAccountError = new TokenAccountError(
        `Invalid token account data for ${toWalletPubkey.toString()}`,
        error,
      );
      Sentry.captureException(tokenAccountError, {
        level: "error",
        tags: {
          category: "token-account-creation-error",
          errorType: "invalid-account-data",
        },
        extra: {
          fromWallet: fromWallet.publicKey.toString(),
          toWallet: toWalletPubkey.toString(),
          bonkMint: bonkMint.toString(),
        },
      });
      throw tokenAccountError;
    }

    // Generic token account error
    const genericError = new TokenAccountError(
      `Failed to get/create associated token account for wallet ${toWalletPubkey.toString()}`,
      error,
    );
    Sentry.captureException(genericError, {
      level: "error",
      tags: {
        category: "token-account-creation-error",
        errorType: "unknown",
      },
      extra: {
        error: error.message,
        fromWallet: fromWallet.publicKey.toString(),
        toWallet: toWalletPubkey.toString(),
        bonkMint: bonkMint.toString(),
      },
    });
    throw genericError;
  }
}

export function getTreasuryWallet(): Keypair {
  if (!process.env.CHOMP_TREASURY_PRIVATE_KEY) {
    throw new Error("Missing treasury key");
  }
  return Keypair.fromSecretKey(
    base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY),
  );
}

export const sendBonk = async (
  toWallet: PublicKey,
  amount: number,
  chompResults?: ChompResult[],
  questionIds?: number[],
) => {
  const fromWallet = getTreasuryWallet();
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

  const fromTokenAccount = await getAssociatedTokenAddress(
    bonkMint,
    fromWallet.publicKey,
  );

  // Get or create the destination token account
  const destinationAccount = await getDestinationSplAccount(
    CONNECTION,
    fromWallet,
    bonkMint,
    toWallet,
  );

  const instruction = createTransferInstruction(
    fromTokenAccount,
    destinationAccount.address,
    fromWallet.publicKey,
    amount,
  );

  const instructions = [];

  instructions.push(instruction);

  let blockhashResponse = await CONNECTION.getLatestBlockhash();

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
  const computeUnitFix = 4794;
  // Buffer to make sure the transaction doesn't fail because of less compute units
  const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(computeUnitFix * 1.1),
  });

  // update the instructions with compute unit instruction (unshift will move compute unit to the start and it is recommended in docs as well.)
  instructions.unshift(computeUnitsIx);

  blockhashResponse = await CONNECTION.getLatestBlockhash();

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

  const payload = await getJwtPayload();

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
  } catch (error: any) {
    // Check for specific transaction error types
    let txError;

    if (error.message?.includes("insufficient funds")) {
      txError = new InsufficientFundsError(
        `Insufficient funds for transaction from ${treasuryAddress} to ${toWallet}`,
        error,
      );
    } else if (error.message?.includes("unable to locate this tx")) {
      txError = new BonkTransactionError(
        `Transaction ${signature} not found on chain`,
        error,
      );
    } else {
      txError = new BonkTransactionError(
        `Transaction confirmation failed for ${signature}`,
        error,
      );
    }

    Sentry.captureException(txError, {
      level: "fatal",
      tags: {
        category: "claim-tx-confirmation-error",
        errorType: txError.name.toLowerCase(),
      },
      extra: {
        userId: payload?.sub,
        userAddress: toWallet.toString(),
        questionIds,
        chompResults: chompResults?.map((r) => r.id),
        transactionHash: signature,
        amount,
        error: error.message,
      },
    });

    throw txError;
  }
  await Sentry.flush(SENTRY_FLUSH_WAIT);

  return signature;
};
