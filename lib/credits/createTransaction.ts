import { getTreasuryAddress } from "@/actions/getTreasuryAddress";
import { getJwtPayload } from "@/app/actions/jwt";
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
  const startTime = Date.now();
  let lastLogTime = startTime;

  const logStep = (stepName: string) => {
    const now = Date.now();
    const stepDuration = ((now - lastLogTime) / 1000).toFixed(2);
    const totalDuration = ((now - startTime) / 1000).toFixed(2);
    console.log(
      `CreateTransaction - ${stepName}\n` +
      `Step duration: ${stepDuration}s\n` +
      `Total duration: ${totalDuration}s\n` +
      '------------------------'
    );
    lastLogTime = now;
  };

  logStep('Starting createCreditPurchaseTransaction');

  if (!wallet || !isSolanaWallet(wallet)) return null;

  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }
  logStep('JWT payload retrieved');

  const signer = await wallet.getSigner();
  const walletPubkey = new PublicKey(wallet.address);

  const treasuryAddress = await getTreasuryAddress();

  if (!treasuryAddress) {
    return {
      error: "Invalid treasury address",
    };
  }

  // Create Transaction
  let tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: walletPubkey,
      toPubkey: new PublicKey(treasuryAddress),
      lamports: new Decimal(process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT!)
        .mul(creditsToBuy)
        .mul(LAMPORTS_PER_SOL)
        .toNumber(),
    }),
  );

  // Setup priority fee and compute units
  tx = await setupTransactionPriorityFee(tx, walletPubkey);

  setIsProcessingTx(true);
  logStep('Transaction setup');

  try {
    // Sign transaction
    const signedTransaction = await signer.signTransaction(tx);
    logStep('Transaction signed');

    const signature = bs58.encode(signedTransaction.signature!);
    logStep('Signature encoded');

    return { transaction: signedTransaction, signature };
  } catch {
    logStep('Error in transaction signing');
    setIsProcessingTx(false);
    return null;
  }
}
