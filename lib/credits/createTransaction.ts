import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana-core";
import * as Sentry from "@sentry/nextjs";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

import { UserRejectedBuyCreditTxError } from "../error";
import { setupTransactionPriorityFee } from "../priorityFee";

/**
 * Creates a Transaction of SOL transfer and signed by the user
 *
 * @param creditsToBuy - Number of credits to purchase
 * @param wallet - User's wallet instance from Dynamic SDK
 * @param setIsProcessingTx - Callback to update transaction processing state
 *
 * @returns Transaction object with signature, or null if transaction signing fails
 */
export async function createCreditPurchaseTransaction(
  creditsToBuy: number,
  wallet: Wallet,
  setIsProcessingTx: (isProcessingTx: boolean) => void,
) {
  if (!wallet || !isSolanaWallet(wallet)) return null;

  const payload = await getJwtPayload();

  const signer = await wallet.getSigner();
  const walletPubkey = new PublicKey(wallet.address);

  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_PUBLIC_ADDRESS!;

  if (!treasuryAddress) {
    throw new Error("Treasury address not found");
  }

  // Create base transaction
  let tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: walletPubkey,
      toPubkey: new PublicKey(treasuryAddress),
      lamports:
        creditsToBuy *
        Number(process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT) *
        LAMPORTS_PER_SOL,
    }),
  );

  // Setup priority fee and compute units
  tx = await setupTransactionPriorityFee(tx, walletPubkey);

  setIsProcessingTx(true);

  try {
    // Sign transaction
    const signedTransaction = await signer.signTransaction(tx);
    const signature = bs58.encode(signedTransaction.signature!);

    return { transaction: signedTransaction, signature };
  } catch (error) {
    setIsProcessingTx(false);
    const transactionRejectedError = new UserRejectedBuyCreditTxError(
      "User rejected transaction of buy credits",
      { cause: error },
    );
    Sentry.captureException(transactionRejectedError, {
      extra: {
        userId: payload?.sub,
        creditAmount: creditsToBuy,
        address: wallet.address,
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return null;
  }
}
