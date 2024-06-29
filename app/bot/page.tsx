"use client";
import { FC, FormEventHandler, useEffect, useState } from "react";
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

const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

const ConnectWithOtpView: FC = () => {
  const [tuser, setTUser] = useState(null);
  const [burned, setBurned] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const { sendOneTimeCode, createOrRestoreSession } = useEmbeddedWallet();
  const { verifyOneTimePassword, connectWithEmail } = useConnectWithOtp();

  const userWallets = useUserWallets();
  const { successToast } = useToast();

  const primaryWallet = userWallets.length > 0 ? userWallets[0] : null;

  const address = primaryWallet?.address || ""



  const sendOTP = async () => {
    try {
      await sendOneTimeCode();
      setOtpSent(true);
    } catch (e) {
      console.error(e);
    }
  };

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

    } catch (err) {
      console.log(err, 'e')
    }
  };

  const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

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
  };

  const handleCopyToClipboard = async () => {
    await copyTextToClipboard(address);
    successToast(
      "Copied to clipboard",
      `Copied ${formatAddress(address)} to clipboard`,
    );
  };



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


  // useEffect(() => {
  //   // Ensure Telegram Web App API is available
  //   const script = document.createElement('script');
  //   script.src = "https://telegram.org/js/telegram-web-app.js";
  //   script.async = true;
  //   document.body.appendChild(script);

  //   script.onload = () => {
  //     Telegram.WebApp.ready();

  //     // Retrieve user details
  //     const initDataUnsafe = Telegram.WebApp.initDataUnsafe;
  //     const user = initDataUnsafe.user;
  //     console.log(Telegram.WebApp.initData, initDataUnsafe)

  //     dataVerification(Telegram.WebApp.initData)

  //     // Set user details in state
  //     if (user) {
  //       setTUser(user);
  //     }
  //   };

  //   return () => {
  //     document.body.removeChild(script);
  //   };
  // }, []);




  return (
    <div className="space-y-6 flex flex-col w-2/3 mt-12">
      <p className="text-2xl text-center">Good job chompin!</p>
      <p>
        You have 8 questions to reveal. You must reveal in order to see the
        answer and find out if you won anything.
      </p>
      {address !== '' &&
        <div className="text-center flex flex-col ml">
          Your address:
          <p className="whitespace-nowrap overflow-hidden text-ellipsis text-center ">
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
        </div>}
      <div />
      {!primaryWallet && !verificationSent && (
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

      {!primaryWallet && !!verificationSent && !verificationSuccess && (
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

      {(primaryWallet || !!verificationSuccess) && !otpSent &&
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
            className="rounded-sm p-2 text-black w-full mb-2"
          />
          <button onClick={verifyOTPAndBurn} className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2">Verify Burn</button>
        </div>
      }

      {!!burned && (
        <p className="text-2xl text-[#A3A3EC]">
          BONK burn and reveal successful! Return to Telegram.
        </p>
      )}

    </div>
  );
};

export default ConnectWithOtpView;
