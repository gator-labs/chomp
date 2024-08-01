/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useToast } from "@/app/providers/ToastProvider";
import { getRevealQuestionsData, getUserId } from "@/app/queries/bot";
import { genBonkBurnTx } from "@/app/utils/solana";
import { extractId } from "@/app/utils/telegramId";
import {
  useConnectWithOtp,
  useIsLoggedIn,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { Connection, PublicKey } from "@solana/web3.js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import BotRevealClaim from "../BotRevealClaim/BotRevealClaim";
import { Button } from "../Button/Button";
import RevealHistoryInfo from "../RevealHistoryInfo/RevealHistoryInfo";
import RevealQuestionsFeed from "../RevealQuestionsFeed/RevealQuestionsFeed";
import { TextInput } from "../TextInput/TextInput";

const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

declare global {
  interface Window {
    Telegram: any;
  }
}

export interface Question {
  id: number;
  question: string;
  revealAtDate: Date;
  answerCount: number;
  revealAtAnswerCount: number | null;
  revealTokenAmount: number;
}

export default function BotMiniApp() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [userId, setUserId] = useState<string>();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [questions, setQuestions] = useState([]);
  const [isVerificationIsInProgress, setIsVerificationIsInProgress] =
    useState<boolean>(false);
  const [isVerificationSucceed, setIsVerificationSucceed] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRevealQuestions, setSelectedRevealQuestions] = useState<
    number[]
  >([]);
  const isLoggedIn = useIsLoggedIn();
  const { verifyOneTimePassword, connectWithEmail } = useConnectWithOtp();
  const userWallets = useUserWallets();
  const { errorToast } = useToast();
  const router = useRouter();
  const primaryWallet = userWallets.length > 0 ? userWallets[0] : null;

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRevealQuestions([]);
    } else {
      setSelectedRevealQuestions(
        questions.map((question: Question, index) => question.id),
      );
    }
    setSelectAll(!selectAll);
  };

  const handleSelect = (id: number) => {
    if (selectedRevealQuestions.includes(id)) {
      setSelectedRevealQuestions(
        selectedRevealQuestions.filter((i) => i !== id),
      );
    } else {
      setSelectedRevealQuestions([...selectedRevealQuestions, id]);
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
      errorToast("Error occurred while verifying otp");
    }
  };

  const handleUserId = async (telegramId: string) => {
    if (telegramId) {
      const response = await getUserId(telegramId);
      if (response) {
        setUserId(response?.id);
        setWalletAddress(response.wallets[0].address);
      } else {
        errorToast("No user found for this telegram ID");
      }
    } else {
      errorToast("Invalid telegram ID");
    }
  };

  const dataVerification = async (initData: any) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ initData }),
    };
    try {
      const response = await fetch(`/api/validate`, options);
      const telegramRawData = await response.json();
      const telegramId = extractId(telegramRawData.message);
      await handleUserId(telegramId);
    } catch (err) {
      console.error(err);
      errorToast("Not an authorized request to access");
    }
  };

  const getRevealQuestions = async (userId: string) => {
    const response = await getRevealQuestionsData(userId);
    if (response) {
      setQuestions(response);
    } else {
      errorToast("Failed to get reveal questions");
    }
  };

  useEffect(() => {
    if (userId) {
      getRevealQuestions(userId);
    }
  }, [userId]);

  useEffect(() => {
    // Ensure Telegram Web App API is available
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.Telegram.WebApp.ready();
      dataVerification(window.Telegram.WebApp.initData);
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
  }, [selectedRevealQuestions, questions]);

  useEffect(() => {
    setIsLoading(false);
  }, [isLoggedIn]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <svg
          aria-hidden="true"
          className="inline w-14 h-14 text-neutral-500 animate-spin fill-neutral-50"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    );
  }

  return (
    <>
      {isLoggedIn && !isVerificationSucceed ? (
        <BotRevealClaim activeTab={activeTab} setActiveTab={setActiveTab} wallet={walletAddress}>
          {activeTab === 0 ? (
            <RevealQuestionsFeed
              selectAll={selectAll}
              handleSelectAll={handleSelectAll}
              questions={questions}
              selectedRevealQuestions={selectedRevealQuestions}
              handleSelect={handleSelect}
            />
          ) : (
            <RevealHistoryInfo
              onClick={() => {
                router.push("/");
              }}
            />
          )}
        </BotRevealClaim>
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
