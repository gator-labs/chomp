import { getJwtPayload } from "@/app/actions/jwt";
import { getSolPaymentAddress } from "@/app/utils/getSolPaymentAddress";
import { setupTransactionPriorityFee } from "@/lib/priorityFee";
import type { Wallet } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana-core";
import { CreditPack } from "@prisma/client";
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
 * @param creditPack - Credit pack (optional).
 *
 * @returns Transaction object with signature, or null if transaction signing fails
 */
export async function createCreditPurchaseTransaction(
  creditsToBuy: number,
  wallet: Wallet,
  creditPack: CreditPack | null = null,
) {
  if (!isSolanaWallet(wallet)) return null;

  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  if (creditPack) {
    // Basic sanity checks; we will verify the full
    // details later on the backend.

    if (!creditPack.costPerCredit) throw new Error("Invalid credit pack");

    if (creditPack.amount !== creditsToBuy)
      throw new Error("Credit pack amount mismatch");
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
  let tx = new Transaction();

  // Setup priority fee and compute units
  tx = await setupTransactionPriorityFee(tx, walletPubkey);

  const costPerCredit =
    creditPack?.costPerCredit ??
    process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT!;

  tx.add(
    SystemProgram.transfer({
      fromPubkey: walletPubkey,
      toPubkey: new PublicKey(solPaymentAddress),
      lamports: new Decimal(costPerCredit)
        .mul(creditsToBuy)
        .mul(LAMPORTS_PER_SOL)
        .toNumber(),
    }),
  );

  try {
    // Sign transaction
    const signedTransaction = await signer.signTransaction(tx);
    const signature = bs58.encode(signedTransaction.signature!);

    return {
      transaction: signedTransaction.serialize().toString("base64"),
      signature,
    };
  } catch {
    return null;
  }
}
