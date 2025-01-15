// Note: "use server" is not used as Dynamic package is not compatible server side
import { getTreasuryAddress } from "@/actions/getTreasuryAddress";
import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { UserRejectedBuyCreditTxError } from "@/lib/error";
import { setupTransactionPriorityFee } from "@/lib/priorityFee";
import type { Wallet } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana-core";
import * as Sentry from "@sentry/nextjs";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

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

  const treasuryAddress = await getTreasuryAddress();

  if (!treasuryAddress) {
    return {
      error: "Invalid treasury address",
    };
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
