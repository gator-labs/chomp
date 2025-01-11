import { createSignedSignatureChainTx } from "@/app/actions/credits/createChainTx";
import { getJwtPayload } from "@/app/actions/jwt";
import { HIGH_PRIORITY_FEE } from "@/app/constants/fee";
import { getRecentPrioritizationFees } from "@/app/queries/getPriorityFeeEstimate";
import { CONNECTION } from "@/app/utils/solana";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { ComputeBudgetProgram } from "@solana/web3.js";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";

export async function creditPurchaseTx(
  creditsToBuy: number,
  primaryWallet: Wallet | null,
) {
  const payload = await getJwtPayload();

  if (!payload) return null;

  if (!primaryWallet || !isSolanaWallet(primaryWallet)) return null;

  try {
    const signer = await primaryWallet.getSigner();

    const wallet = new PublicKey(primaryWallet.address);

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet,
        toPubkey: new PublicKey("FcK2aTUPqQtneyLyRHibeft22pq6JfVkkGN25FPkGTCn"),
        lamports:
          creditsToBuy *
          Number(process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT) *
          LAMPORTS_PER_SOL,
      }),
    );

    const { blockhash, lastValidBlockHeight } =
      await CONNECTION.getLatestBlockhash("confirmed");

    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = wallet;

    // It is recommended to add the compute limit instruction before adding other instructions
    const computeUnitFix = 4960;

    // Buffer to make sure the transaction doesn't fail because of less compute units
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: Math.round(computeUnitFix * 1.1),
    });
    tx.add(modifyComputeUnits);

    let estimateFee = await getRecentPrioritizationFees(tx);

    // Verify the estimateFee is not null due to RPC request failure in some cases
    if (estimateFee === null) {
      for (let i = 0; i < 2; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        estimateFee = await getRecentPrioritizationFees(tx);
        if (estimateFee !== null) break;
      }

      // Set median priority fee if estimateFee is still null
      if (estimateFee === null) {
        estimateFee = {
          result: {
            priorityFeeLevels: {
              high: HIGH_PRIORITY_FEE,
            },
          },
        };
      }
    }

    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: Math.round(estimateFee?.result?.priorityFeeLevels?.high),
    });

    tx.add(addPriorityFee);

    try {
      const { blockhash, lastValidBlockHeight } =
        await CONNECTION.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.lastValidBlockHeight = lastValidBlockHeight;

      const signedTransaction = await signer.signTransaction(tx);

      let signature;

      if (signedTransaction.signature) {
        signature = bs58.encode(signedTransaction.signature);
      }

      await createSignedSignatureChainTx(creditsToBuy, signature!);

      const txHash = await CONNECTION.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: true,
        },
      );

      const currentBlockhash = await CONNECTION.getLatestBlockhash();
      await CONNECTION.confirmTransaction(
        {
          signature: txHash,
          ...currentBlockhash,
        },
        "confirmed",
      );

      if (!txHash) {
        throw new Error("Failed to send transaction");
      }

      return txHash;
    } catch (error) {
      console.log("Transaction Sign or Confirmation Error:", error);
      return null;
    }
  } catch (error) {
    console.log("Transaction Prepare Error:", error);
    return null;
  }
}
