import { getJwtPayload } from "@/app/actions/jwt";
import { getSolPaymentAddress } from "@/app/utils/getSolPaymentAddress";
import { setupTransactionPriorityFee } from "@/lib/priorityFee";
import type { Wallet } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana-core";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import Decimal from "decimal.js";

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

  if (!payload) {
    return null;
  }

  const signer = await wallet.getSigner();
  const walletPubkey = new PublicKey(wallet.address);

  const solPaymentAddress = await getSolPaymentAddress();

  if (!solPaymentAddress) {
    return {
      error: "SOL Payment Address is not defined",
    };
  }

  // Create Transaction
  let tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: walletPubkey,
      toPubkey: new PublicKey(solPaymentAddress),
      lamports: new Decimal(process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT!)
        .mul(creditsToBuy)
        .mul(LAMPORTS_PER_SOL)
        .toNumber(),
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
  } catch {
    setIsProcessingTx(false);
    return null;
  }
}
