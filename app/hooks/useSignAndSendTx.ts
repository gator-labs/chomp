"use client";

import { useEffect, useState } from "react";

import { Transaction, VersionedTransaction } from "@solana/web3.js";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import {
  isPhantomRedirectConnector,
  SignAndSendTransactionListener,
} from "@dynamic-labs/wallet-connector-core";

const useSignAndSendTx = () => {
  const { primaryWallet } = useDynamicContext();

  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [errorCode, setErrorCode] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!primaryWallet?.connector) return;
    if (!isPhantomRedirectConnector(primaryWallet?.connector)) return;
    const handler: SignAndSendTransactionListener = (response) => {
      if (response.signature) {
        setSignature(response.signature);
      } else {
        setErrorCode(response.errorCode);
        setErrorMessage(response.errorMessage);
      }
    };

    primaryWallet.connector.on("signAndSendTransaction", handler);
    return () => {
      if (!isPhantomRedirectConnector(primaryWallet?.connector)) return;
      primaryWallet.connector.off("signAndSendTransaction", handler);
    };
  }, [primaryWallet?.connector]);

  const execute = async (transaction: Transaction | VersionedTransaction) => {
    if (!primaryWallet) return;

    const signer = await primaryWallet.connector.getSigner<ISolana>();

    return signer.signAndSendTransaction(transaction);
  };

  return { errorCode, errorMessage, execute, signature, setSignature };
};

export default useSignAndSendTx;
