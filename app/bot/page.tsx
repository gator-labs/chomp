"use client";

import {
  useConnectWithOtp,
  useDynamicContext,
  useUserWallets,
  useEmbeddedWallet,
} from "@dynamic-labs/sdk-react-core";
import { Connection, PublicKey } from "@solana/web3.js";
import { ISolana } from "@dynamic-labs/solana";
// import { getLogs } from '@solana-developers/helpers'

import { genBonkBurnTx } from "../utils/solana"

import { FC, FormEventHandler, useState } from "react";
import { sign } from "crypto";
import error from "next/error";
import { redirect } from "next/navigation";
// import console from "console";
const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

const ConnectWithOtpView: FC = () => {
  const { user, isAuthenticated } = useDynamicContext();

  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // console.log(user, isAuthenticated)
  // const { primaryWallet } = useDynamicContext();
  const userWallets = useUserWallets();
  const primaryWallet = userWallets.length > 0 ? userWallets[0] : null;

  const [burned, setBurned] = useState(false);



  const { sendOneTimeCode, createOrRestoreSession } = useEmbeddedWallet();


  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);



  // console.log(userWallets, 'wallet', primaryWallet, 'user', user)





  const sendOTP = async () => {
    console.log('otp sent')
    try {
      console.log("sent")
      // console.log(await sendOneTimeCode())
      await sendOneTimeCode();
      setOtpSent(true);
    } catch (e) {
      console.error(e);
    }
  };



  const onBurn = async () => {

    try {


      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
      } = await CONNECTION.getLatestBlockhashAndContext();

      const signer = await primaryWallet!.connector.getSigner<ISolana>();


      // console.log(primaryWallet?.address)

      const balance = await CONNECTION.getBalance(new PublicKey(primaryWallet!.address));
      console.log('Sender account balance:', balance);

      if (balance < 1000) {
        throw new Error('Insufficient balance for the transaction');
      }

      // console.log(blockhash, "b")
      const tx = await genBonkBurnTx(
        primaryWallet!.address,
        blockhash,
        10,
      );
      console.log(tx, signer, 'tx')

      // await sendOneTimeCode();

      // const otc = await promptForOneTimeCode();

      // await createOrRestoreSession(otc);

      const signature = await signer
        .signAndSendTransaction(tx)
        .then((res: any) => {
          // eslint-disable-next-line no-console
          console.log(res)
          // setTxnHash(res.signature);
        })
        .catch((errror: any) => {
          // if (reason.message.includes("Passkey not found")) {

          console.log(error, 'err')
          // }
          // eslint-disable-next-line no-console
          // console.error(reason.message, 'err');
        });

      console.log(signature)



      setBurned(true);


      // await CONNECTION.confirmTransaction({
      //   blockhash: blockhash,
      //   lastValidBlockHeight: lastValidBlockHeight,
      //   signature,
      // });
      // console.log(signature)
      // const logs = await getLogs(CONNECTION, tx);
      // console.log(logs)
    } catch (err) {
      console.log(err, 'e')

    }
  };

  const { verifyOneTimePassword, connectWithEmail } = useConnectWithOtp();

  const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    console.log("email")

    await connectWithEmail(event.currentTarget.email.value);
    setVerificationSent(true);
  };

  const verifyOTPAndBurn = async () => {
    try {
      await createOrRestoreSession({ oneTimeCode: otp });
      await onBurn();
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitOtpHandler: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    const otp = event.currentTarget.otp.value;

    await verifyOneTimePassword(otp);
    setVerificationSuccess(true);
    // redirect('/bot')
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
      {/* <button
        className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2"
        onClick={onBurn}
      >
        Burn BONK and reveal
      </button> */}
      {/* )} */}

      {!!verificationSuccess && !otpSent &&
        <div>
          <button onClick={sendOTP} className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2 mt-2">Burn Bonk</button>
        </div>}

      {
        !burned && otpSent &&
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="rounded-sm p-2 text-black w-full"
          />
          <button onClick={verifyOTPAndBurn} className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2">Verify Burn</button>
        </div>
      }

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
