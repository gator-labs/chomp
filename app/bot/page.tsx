"use client";

import {
  useConnectWithOtp,
  useDynamicContext,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { Connection, PublicKey } from "@solana/web3.js";
import { ISolana } from "@dynamic-labs/solana";
// import { getLogs } from '@solana-developers/helpers'

import { genBonkBurnTx } from "../utils/solana"

import { FC, FormEventHandler, useState } from "react";
import { sign } from "crypto";
const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

const ConnectWithOtpView: FC = () => {
  const { user } = useDynamicContext();
  // const { primaryWallet } = useDynamicContext();
  const userWallets = useUserWallets();
  const primaryWallet = userWallets.length > 0 ? userWallets[0] : null;
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [burned, setBurned] = useState(false);

  const { verifyOneTimePassword, connectWithEmail } = useConnectWithOtp();

  console.log(userWallets, 'wallet', primaryWallet, 'user', user)


  const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    await connectWithEmail(event.currentTarget.email.value);
    setVerificationSent(true);
  };

  const onSubmitOtpHandler: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    const otp = event.currentTarget.otp.value;

    await verifyOneTimePassword(otp);
    setVerificationSuccess(true);
  };

  const onBurn = async () => {
    setBurned(true);
    try {
      const blockhash = await CONNECTION.getLatestBlockhash();

      const signer = await primaryWallet!.connector.getSigner<ISolana>();


      console.log(primaryWallet?.address)

      const balance = await CONNECTION.getBalance(new PublicKey(primaryWallet!.address));
      console.log('Sender account balance:', balance);

      if (balance < 1000) {
        throw new Error('Insufficient balance for the transaction');
      }


      const tx = await genBonkBurnTx(
        primaryWallet!.address,
        blockhash.blockhash,
        1000,
      );
      console.log(tx, signer, 'tx')
      const signature = await signer.signAndSendTransaction(tx);




      await CONNECTION.confirmTransaction({
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature,
      });
      // const logs = await getLogs(CONNECTION, tx);
      // console.log(logs)
    } catch (err) {
      console.log(err)

    }
  };

  return (
    <div className="space-y-6 flex flex-col w-2/3 mt-12">
      <p className="text-2xl text-center">Good job chompin!</p>
      <p>
        You have 8 questions to reveal. You must reveal in order to see the
        answer and find out if you won anything.
      </p>
      <div />
      {!verificationSent && (
        <form
          key="sms-form"
          onSubmit={onSubmitEmailHandler}
          className="flex justify-center flex-col space-y-4 w-full"
        >
          <div>
            <label htmlFor="email" className="">
              Email:
            </label>
            <input
              type="text"
              name="email"
              className="rounded-sm p-2 text-black w-full"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2"
            >
              Continue
            </button>
          </div>
        </form>
      )}

      {!!verificationSent && !verificationSuccess && (
        <form
          key="otp-form"
          className="flex justify-center flex-col space-y-4 w-full"
          onSubmit={onSubmitOtpHandler}
        >
          <input
            type="text"
            name="otp"
            placeholder="OTP"
            className="rounded-sm p-2 text-black w-full"
          />
          <button
            type="submit"
            className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2"
          >
            Submit
          </button>
        </form>
      )}

      {/* {!!verificationSuccess && !burned && ( */}
      <button
        className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2"
        onClick={onBurn}
      >
        Burn BONK and reveal
      </button>
      {/* )} */}

      {!!burned && (
        <p className="text-2xl text-[#A3A3EC]">
          BONK burn and reveal successful! Return to Telegram.
        </p>
      )}

      {/* {!!user && (
        <>
          <p>Authenticated user:</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      )} */}
    </div>
  );
};

export default ConnectWithOtpView;
