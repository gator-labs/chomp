"use client";

import useSignAndSendTransaction from "@/app/hooks/useSignAndSendTransaction";
import { CONNECTION } from "@/app/utils/solana";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useState } from "react";

export const SendTransactionSolanaSection = () => {
  const { execute } = useSignAndSendTransaction();
  const { primaryWallet } = useDynamicContext();

  const [txnHash, setTxnHash] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("0.05");

  if (!primaryWallet) return null;

  const onSubmit = async (event: any) => {
    event.preventDefault();

    const fromKey = new PublicKey(primaryWallet.address);
    const toKey = new PublicKey(to);
    const valueInLamports = Number(
      amount ? Number(amount) * LAMPORTS_PER_SOL : undefined,
    );

    const sendTransaction = new Transaction();
    sendTransaction.add(
      SystemProgram.transfer({
        fromPubkey: fromKey,
        lamports: valueInLamports,
        toPubkey: toKey,
      }),
    );

    if (!CONNECTION) {
      throw new Error("unable to retrieve Solana Connection");
    }

    const blockhash = await CONNECTION.getLatestBlockhash();
    sendTransaction.recentBlockhash = blockhash.blockhash;
    sendTransaction.feePayer = fromKey;

    execute(sendTransaction);
  };

  return (
    <>
      <p>Send Legacy TX to SOLANA address</p>
      <input
        name="address"
        type="text"
        required
        className="text-black"
        placeholder="Address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        name="amount"
        type="text"
        required
        className="text-black"
        placeholder="0.05"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit" onClick={onSubmit}>
        Send
      </button>
      <span data-testid="transaction-section-result-hash">{txnHash}</span>
    </>
  );
};
