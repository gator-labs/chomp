"use client";
import { FC, FormEventHandler, useEffect, useState } from "react";
import Image from "next/image";
import {
  useConnectWithOtp,
  useDynamicContext,
  useUserWallets,
  useEmbeddedWallet,
  CopyIcon,
} from "@dynamic-labs/sdk-react-core";
import { Connection, PublicKey } from "@solana/web3.js";
import { ISolana } from "@dynamic-labs/solana";
import { genBonkBurnTx } from "../utils/solana"
import { copyTextToClipboard } from "../utils/clipboard";
import { Button } from "../components/Button/Button";
import { useToast } from "../providers/ToastProvider";
import { formatAddress } from "../utils/wallet";
import ChompCover from '@/public/images/ChompBotCover.png'
import arrowIcon from '@/public/icons/arrowIcon.svg'


const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

declare global {
  interface Window {
    Telegram: any;
  }
}

const ConnectWithOtpView: FC = () => {
  // const [tuser, setTUser] = useState(null);
  const [burned, setBurned] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const { sendOneTimeCode, createOrRestoreSession } = useEmbeddedWallet();
  const { verifyOneTimePassword, connectWithEmail } = useConnectWithOtp();

  const userWallets = useUserWallets();
  const { successToast, errorToast } = useToast();

  const primaryWallet = userWallets.length > 0 ? userWallets[0] : null;

  const address = primaryWallet?.address || ""



  const onBurn = async () => {
    try {
      const {
        value: { blockhash }
      } = await CONNECTION.getLatestBlockhashAndContext();

      const signer = await primaryWallet!.connector.getSigner<ISolana>();

      const balance = await CONNECTION.getBalance(new PublicKey(primaryWallet!.address));

      if (balance < 1000) {
        throw new Error('Insufficient balance for the transaction');
      }

      const tx = await genBonkBurnTx(
        primaryWallet!.address,
        blockhash,
        10,
      );

      await signer
        .signAndSendTransaction(tx)

      setBurned(true);

    } catch (err: any) {
      const errorMessage = err?.message ? err.message : "Failed to Burn";
      errorToast(errorMessage);
    }

  };

  const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    try {
      await connectWithEmail(event.currentTarget.email.value);
      setVerificationSent(true);
    } catch (error) {
      const errorMessage = (error as { message: string }).message;
      errorToast(errorMessage);
    }
  };



  const sendOTP = async () => {
    try {
      await sendOneTimeCode();
      setOtpSent(true);
    } catch (error) {
      console.error("Error while initaiting bonk burn", error);
      errorToast("Failed to send verification email. Please try again.");
    }
  };

  const onSubmitOtpHandler: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    try {
      const otp = event.currentTarget.otp.value;
      await verifyOneTimePassword(otp);

      await createOrRestoreSession({ oneTimeCode: otp });

      // await onBurn();
      setVerificationSuccess(true);
    } catch (error) {

      console.error("Error occurred while verifying otp:", error);
      errorToast("Error occurred while verifying otp");
    }
  };

  const verifyOTPAndBurn = async () => {
    try {
      await createOrRestoreSession({ oneTimeCode: otp });
      await onBurn();
    } catch (error) {
      console.error("Error while burn", error);
      errorToast("Error while burn");
    }
  };


  const handleCopyToClipboard = async () => {
    try {
      await copyTextToClipboard(address);
      successToast(
        "Copied to clipboard",
        `Copied ${formatAddress(address)} to clipboard`,
      );
    } catch (error) {
      errorToast("Error in copy to clip");
    };

  }


  // const dataVerification = async (initData) => {
  //   // setVerifying(true);

  //   const options = {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ initData }),
  //   };

  //   fetch(
  //     `https://7b6cbaff4eb5.ngrok.app/api/validate`,
  //     options,
  //   )
  //     .then((response) => response.json())
  //     .then((response) => {
  //       console.log(response)
  //       // setUUID(response.verificationUUID);
  //     })
  //     .catch((err) => console.error(err));
  // };


  useEffect(() => {
    // Ensure Telegram Web App API is available
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.Telegram.WebApp.ready();

      // Retrieve validated user details
      // dataVerification(Telegram.WebApp.initData)

      // Set user details in state
      // if (user) {
      // setTUser(user);
      // }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleClose = () => {
    if (window.Telegram) {
      window.Telegram.WebApp.close();
    }
  };


  return (
    <div className="space-y-6 flex flex-col w-3/3 mt-12 p-4 items-center justify-center">
      <Image src={ChompCover} width={400} height={400} alt="Chomp Cover" className="mt-12" />
      {/* <button onClick={handleClose} > Close</button> */}

      {/* {address !== '' &&
        <div className="text-center flex flex-col ml">
          Your address:
          <p className="break-words">
            {address}
          </p>

          <span>
            <Button
              isPill
              className="!p-0 !w-[28px] !h-[28px] bg-[#A3A3EC] border-none ml-2"
              onClick={handleCopyToClipboard}
            >
              <CopyIcon />
            </Button>
          </span>
        </div>} */}
      <div />
      {!primaryWallet && !verificationSent && (
        <form
          key="sms-form"
          onSubmit={onSubmitEmailHandler}
          className="flex justify-center flex-col space-y-4 w-full"
        >
          <p className="text-2xl font-bold">Chomp at its full potential!</p>
          <p className="text-left">
            To access all features of Chomp (i.e revealing answer, viewing results, earning BONK), you can register by entering your e-mail below.
          </p>
          <div>
            <label htmlFor="email" className="">
              Email:
            </label>
            <input
              type="text"
              name="email"
              className="rounded-sm p-2 text-black w-full"
              placeholder="Enter your email here"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full rounded-sm bg-[#A3A3EC] text-base p-2 text-black flex flex-row justify-center items-center"
            >
              Send OTP
              <Image src={arrowIcon} width={20} height={20} alt="Chomp Cover" />
            </button>
          </div>
        </form>
      )}

      {!primaryWallet && !!verificationSent && !verificationSuccess && (
        <form
          key="otp-form"
          className="flex justify-center flex-col space-y-4 w-full"
          onSubmit={onSubmitOtpHandler}
        >
          <p className="text-2xl font-bold">Chomp at its full potential!</p>
          <p className="text-left">
            OTP sent to your email! Copy it and paste it here to access all of Chomp’s features!
          </p>
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
            Next
          </button>
        </form>
      )}



      {(primaryWallet || !!verificationSuccess) && !otpSent &&
        <div>
          <p className="text-2xl font-bold">Let&apos;s Keep Chomping! </p>
          <p className="text-left">
            You&apos;re all set. Click below or close this button to continue with your Chomp journey.
          </p>
          <button onClick={handleClose} className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2 mt-2">Continue Chomping</button>
        </div>}

      {/* {
        !burned && otpSent &&
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="rounded-sm p-2 text-black w-full mb-2"
          />
          <button onClick={verifyOTPAndBurn} className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2">Verify Burn</button>
        </div>
      } */}
    </div>
  );
};

export default ConnectWithOtpView;
