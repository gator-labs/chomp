/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useToast } from "@/app/providers/ToastProvider";
import LoadingScreen from "@/app/screens/LoginScreens/LoadingScreen";
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
import ClaimedQuestions from "./ClaimedQuestions/ClaimedQuestions";

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
  const [processedQuestions, setProcessedQuestions] = useState([]);
  const [isVerificationIsInProgress, setIsVerificationIsInProgress] =
    useState<boolean>(false);
  const [isVerificationSucceed, setIsVerificationSucceed] =
    useState<boolean>(false);
  const [isBurnInProgress, setIsBurnInProgress] = useState<boolean>(false);
  const [burnSuccessfull, setBurnSuccessfull] = useState<boolean>(false);
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

  const processBurnAndClaim = async (signature: string) => {
    setIsBurnInProgress(true); // Set loading state before making the API call

    try {
      const response = await fetch(`/api/question/reveal/?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.NEXT_PUBLIC_BOT_API_KEY!,
        },
        body: JSON.stringify({
          questionIds: selectedRevealQuestions,
          burnTx: signature,
        }),
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const processedData = await response.json();

      setProcessedQuestions(processedData);
      setBurnSuccessfull(true);
    } catch (error: any) {
      errorToast(error.message);
      console.error("Error fetching questions:", error.message);
      setBurnSuccessfull(false);
    } finally {
      setIsBurnInProgress(false); // Always unset loading state, regardless of success or failure
    }
  };


  const onBurn = async () => {
    try {
      const {
        value: { blockhash },
      } = await CONNECTION.getLatestBlockhashAndContext();
      const signer = await primaryWallet!.connector.getSigner<ISolana>();

      const totalRevealTokenAmount = selectedRevealQuestions.reduce((acc, id) => {
        const question = questions.find((q: Question) => q.id === id);
        if (question) {
          return acc + question?.["revealTokenAmount"];
        }
        return acc;
      }, 0);

      const tx = await genBonkBurnTx(
        primaryWallet!.address,
        blockhash,
        totalRevealTokenAmount,
      );

      const burnTx = await signer.signAndSendTransaction(tx);

      await processBurnAndClaim(burnTx?.signature);
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
      <LoadingScreen />
    );
  }

  return (
    <>
      {isBurnInProgress && <LoadingScreen />}
      {isLoggedIn && !burnSuccessfull ? (
        <BotRevealClaim activeTab={activeTab} setActiveTab={setActiveTab} wallet={walletAddress}>
          {activeTab === 0 ? (
            <RevealQuestionsFeed
              selectAll={selectAll}
              handleSelectAll={handleSelectAll}
              questions={questions}
              selectedRevealQuestions={selectedRevealQuestions}
              handleSelect={handleSelect}
              onBurn={onBurn}
              wallet={walletAddress}
            />
          ) : (
            <RevealHistoryInfo
              onClick={() => {
                router.push("/");
              }}
            />
          )}
        </BotRevealClaim>
      ) : isLoggedIn && burnSuccessfull ? (
        <ClaimedQuestions questions={processedQuestions} />
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
      )
      }
    </>
  );
}
