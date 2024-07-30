"use client";

import { useToast } from "@/app/providers/ToastProvider";
import { genBonkBurnTx } from "@/app/utils/solana";
import {
  useConnectWithOtp,
  useEmbeddedWallet,
  useIsLoggedIn,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { Connection, PublicKey } from "@solana/web3.js";
import Image from "next/image";
import { FormEventHandler, useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { RiWallet3Fill } from "react-icons/ri";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import RevealQuestionCard from "../RevealQuestionCard/RevealQuestionCard";
import Tabs from "../Tabs/Tabs";
import { TextInput } from "../TextInput/TextInput";

const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

declare global {
  interface Window {
    Telegram: any;
  }
}

const questions = ["", "", ""];

export default function Bot() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isVerificationIsInProgress, setIsVerificationIsInProgress] =
    useState<boolean>(false);
  const [isVerificationSucceed, setIsVerificationSucceed] =
    useState<boolean>(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRevealQuestions, setSelectedRevealQuestions] = useState<
    number[]
  >([]);
  const isLoggedIn = useIsLoggedIn();
  const { sendOneTimeCode, createOrRestoreSession } = useEmbeddedWallet();
  const { verifyOneTimePassword, connectWithEmail } = useConnectWithOtp();
  const userWallets = useUserWallets();
  const { errorToast } = useToast();

  const primaryWallet = userWallets.length > 0 ? userWallets[0] : null;

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRevealQuestions([]);
    } else {
      setSelectedRevealQuestions(questions.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  const handleSelect = (index: number) => {
    if (selectedRevealQuestions.includes(index)) {
      setSelectedRevealQuestions(
        selectedRevealQuestions.filter((i) => i !== index),
      );
    } else {
      setSelectedRevealQuestions([...selectedRevealQuestions, index]);
    }
  };

  const onBurn = async () => {
    try {
      const {
        value: { blockhash },
      } = await CONNECTION.getLatestBlockhashAndContext();

      const signer = await primaryWallet!.connector.getSigner<ISolana>();

      const balance = await CONNECTION.getBalance(
        new PublicKey(primaryWallet!.address),
      );

      if (balance < 1000) {
        throw new Error("Insufficient balance for the transaction");
      }

      const tx = await genBonkBurnTx(primaryWallet!.address, blockhash, 10);

      await signer.signAndSendTransaction(tx);
    } catch (err: any) {
      const errorMessage = err?.message ? err.message : "Failed to Burn";
      errorToast(errorMessage);
    }
  };

  const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    try {
      const emailRegex =
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
      const email = event.currentTarget.email.value;
      if (!emailRegex.test(email)) {
        errorToast("Invalid email");
      } else {
        await connectWithEmail(email);
        setIsVerificationIsInProgress(true);
      }
    } catch (error) {
      const errorMessage = (error as { message: string }).message;
      errorToast(errorMessage);
    }
  };

  const sendOTP = async () => {
    try {
      await sendOneTimeCode();
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
      const otpRegex = /(?:\d{6})/;
      if (!otpRegex.test(otp)) {
        errorToast("Invalid OTP");
      } else {
        await verifyOneTimePassword(otp);
      }
    } catch (error) {
      console.error("Error occurred while verifying otp:", error);
      errorToast("Error occurred while verifying otp");
    }
  };

  const verifyOTPAndBurn = async () => {
    try {
      await createOrRestoreSession({ oneTimeCode: otp!.toString() });
      await onBurn();
    } catch (error) {
      console.error("Error while burn", error);
      errorToast("Error while burn");
    }
  };

  useEffect(() => {
    // Ensure Telegram Web App API is available
    const script = document.createElement("script");
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

  useEffect(() => {
    if (selectedRevealQuestions.length === questions.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRevealQuestions, questions]);

  return (
    <>
      {isLoggedIn && !isVerificationSucceed ? (
        <div className="space-y-6 flex flex-col p-5 items-start justify-center">
          <span className="flex w-full items-center justify-between">
            <Image
              src="/images/gator-head-white.png"
              width={50}
              height={50}
              alt="chomp-head"
            />
            <RiWallet3Fill size={20} />
          </span>
          <p className="text-2xl font-bold">Reveal and Claim</p>
          <p>
            You can view and reveal all cards that are ready to reveal below.
            Only cards with correct answers will Claim tab.
          </p>
          <Tabs
            tabs={["Reveal & Claim", "History"]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onClick={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select All
            </label>
          </div>
          <div className="flex flex-col w-full h-[18rem] gap-2 overflow-auto">
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <RevealQuestionCard
                  key={index}
                  question={question}
                  isSelected={selectedRevealQuestions.includes(index)}
                  handleSelect={() => handleSelect(index)}
                />
              ))
            ) : (
              <p>No questions for reveal. Keep Chomping!</p>
            )}
          </div>
          <Button
            variant="purple"
            size="normal"
            className="gap-2 text-black font-medium mt-4"
            isFullWidth
          >
            {selectedRevealQuestions.length > 0
              ? "Reveal Cards"
              : "Reveal Card"}
          </Button>
        </div>
      ) : isLoggedIn && isVerificationSucceed ? (
        <div>
          <Image
            src="/images/chomp-asset.png"
            width={400}
            height={400}
            alt="Chomp Cover"
            className="mt-5"
          />
          <p className="text-2xl font-bold text-center">
            Let&apos;s Keep Chomping!{" "}
          </p>
          <p className="text-left">
            You&apos;re all set. Click below or close this button to continue
            with your Chomp journey.
          </p>
          <Button
            variant="purple"
            size="normal"
            className="gap-2 text-black font-medium mt-4"
            onClick={() => {
              setIsVerificationSucceed(false);
            }}
            isFullWidth
          >
            Continue Chomping
          </Button>
        </div>
      ) : isVerificationIsInProgress ? (
        <div className="space-y-6 flex flex-col w-3/3 p-4 items-center justify-center">
          <Image
            src="/images/chomp-asset.png"
            width={400}
            height={400}
            alt="Chomp Cover"
            className="mt-5"
          />
          <form
            key="verifyOtp"
            className="flex flex-col justify-center space-y-4 w-full"
            onSubmit={onSubmitOtpHandler}
          >
            <p className="text-[1.6rem] font-bold text-center">
              Chomp at its full potential!
            </p>
            <p className="text-left">
              OTP sent to your email! Copy it and paste it here to access all of
              Chomp&apos;s features!
            </p>
            <div className="flex flex-col gap-4">
              <TextInput
                name="otp"
                placeholder="OTP"
                type="number"
                value={otp !== 0 ? otp : ""}
                onChange={(event) => {
                  setOtp(parseInt(event.target.value));
                }}
                variant="primary"
                required
              />
              <Button
                variant="purple"
                size="normal"
                className="gap-2 text-black font-medium"
                isFullWidth
              >
                Next
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6 flex flex-col w-3/3 p-4 items-center justify-center">
          <Image
            src="/images/chomp-asset.png"
            width={400}
            height={400}
            alt="Chomp Cover"
            className="mt-5"
          />
          <form
            key="emailVerification"
            onSubmit={onSubmitEmailHandler}
            className="flex flex-col justify-center space-y-4 w-full"
          >
            <p className="text-[1.6rem] font-bold text-center">
              Chomp at its full potential!
            </p>
            <p className="text-left">
              To access all features of Chomp (i.e revealing answer, viewing
              results, earning BONK), you can register by entering your e-mail
              below.
            </p>
            <div className="flex flex-col gap-4">
              <TextInput
                name="email"
                placeholder="ENTER YOUR EMAIL HERE"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                variant="primary"
                required
              />
              <Button
                variant="purple"
                size="normal"
                className="gap-2 text-black font-medium"
                isFullWidth
              >
                Send OTP <FaChevronRight />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
