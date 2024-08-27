/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { IClaimedQuestion } from "@/app/interfaces/question";
import { IChompUser } from "@/app/interfaces/user";
import { useToast } from "@/app/providers/ToastProvider";
import {
  doesUserExistByEmail,
  getRevealQuestionsData,
  getVerifiedUser,
  handleCreateUser,
  processBurnAndClaim,
} from "@/app/queries/bot";
import LoadingScreen from "@/app/screens/LoginScreens/LoadingScreen";
import {
  genBonkBurnTx,
  getBonkBalance,
  getSolBalance,
} from "@/app/utils/solana";
import {
  useConnectWithOtp,
  useDynamicContext,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { Connection } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";
import BotLogin from "../BotLogin/BotLogin";
import BotOtpAuth from "../BotOtpAuth/BotOtpAuth";
import BotRevealClaim from "../BotRevealClaim/BotRevealClaim";
import ClaimedQuestions from "../ClaimedQuestions/ClaimedQuestions";
import RevealHistoryInfo from "../RevealHistoryInfo/RevealHistoryInfo";
import RevealQuestionsFeed from "../RevealQuestionsFeed/RevealQuestionsFeed";
import WalletCreatedInfo from "../WalletCreatedInfo/WalletCreatedInfo";

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
  const [user, setUser] = useState<IChompUser | null>();
  const [questions, setQuestions] = useState([]);
  const [processedQuestions, setProcessedQuestions] = useState<
    IClaimedQuestion[]
  >([]);
  const [address, setAddress] = useState("");
  const [isVerificationIsInProgress, setIsVerificationIsInProgress] =
    useState<boolean>(false);
  const [isVerificationSucceed, setIsVerificationSucceed] =
    useState<boolean>(false);
  const [isBurnInProgress, setIsBurnInProgress] = useState<boolean>(false);
  const [isEmailExist, setIsEmailExist] = useState<boolean>(false);
  const [isTermAccepted, setIsTermAccepted] = useState<boolean>(false);
  const [burnSuccessfull, setBurnSuccessfull] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [isFetchingBalance, setIsFetchingBalance] = useState<boolean>(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRevealQuestions, setSelectedRevealQuestions] = useState<
    number[]
  >([]);
  const [userBalance, setUserBalance] = useState({
    solBalance: 0,
    bonkBalance: 0,
  });

  const { primaryWallet, authToken } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { verifyOneTimePassword, connectWithEmail } = useConnectWithOtp();
  const { errorToast } = useToast();
  const router = useRouter();

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
    setIsBurnInProgress(true);
    try {
      const {
        value: { blockhash },
      } = await CONNECTION.getLatestBlockhashAndContext();
      const signer = await primaryWallet!.connector.getSigner<ISolana>();

      const totalRevealTokenAmount = selectedRevealQuestions.reduce(
        (acc, id) => {
          const question = questions.find((q: Question) => q.id === id);
          if (question) {
            return acc + question?.["revealTokenAmount"];
          }
          return acc;
        },
        0,
      );

      const tx = await genBonkBurnTx(
        primaryWallet!.address,
        blockhash,
        totalRevealTokenAmount,
      );

      const burnTx = await signer.signAndSendTransaction(tx);

      // Process Burn and Claim
      if (authToken) {
        const processedData = await processBurnAndClaim(
          authToken,
          burnTx?.signature,
          selectedRevealQuestions,
        );
        if (processedData) {
          setProcessedQuestions(processedData);
          setBurnSuccessfull(true);
        }
      } else {
        throw new Error("Failed to Process");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to Burn";
      errorToast(errorMessage);
      setBurnSuccessfull(false);
    } finally {
      setIsBurnInProgress(false);
    }
  };

  const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    try {
      const emailRegex =
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
      if (!emailRegex.test(email)) {
        errorToast("Invalid email");
      } else {
        const isUserExist: boolean | null = await doesUserExistByEmail(email);
        if (isUserExist) {
          errorToast("Please contact support");
        } else {
          await connectWithEmail(email);
          setIsVerificationIsInProgress(true);
        }
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
        if (!user?.emails[0]?.address && !user?.wallets[0]?.address) {
          setIsVerificationSucceed(true);
        }
      }
    } catch (error) {
      errorToast("Error occurred while verifying otp");
    }
  };

  const dataVerification = async (initData: any) => {
    try {
      setIsLoading(true);
      const response = await getVerifiedUser(initData);
      if (response) {
        setUser(response);
        setEmail(response?.emails[0]?.address);
        if (response?.emails[0]?.address) setIsEmailExist(true);
      } else {
        errorToast("No user found for this telegram ID");
      }
    } catch (err) {
      console.error(err);
      errorToast("Not an authorized request to access");
    } finally {
      setIsLoading(false);
    }
  };

  const storeDynamicUser = async () => {
    if (authToken) {
      try {
        const profile = await handleCreateUser(
          authToken,
          window.Telegram.WebApp.initData,
        );
        if (profile) {
          setUser(profile);
        }
      } catch (error) {
        errorToast("Failed to store user");
      }
    } else {
      errorToast("Failed to store user");
    }
  };

  const getRevealQuestions = async (authToken: string) => {
    const response = await getRevealQuestionsData(authToken);
    if (response) {
      setQuestions(response);
      setIsLoadingQuestions(false);
    } else {
      setIsLoadingQuestions(false);
      errorToast("Failed to get reveal questions");
    }
  };

  const getUserBalance = async () => {
    setIsFetchingBalance(true);
    try {
      const solBalance = await getSolBalance(primaryWallet!.address);
      const bonkBalance = await getBonkBalance(primaryWallet!.address);

      setUserBalance({
        solBalance: solBalance,
        bonkBalance: bonkBalance,
      });
      setIsFetchingBalance(false);
    } catch (error) {
      console.error("Error fetching balances:", error);
      setIsFetchingBalance(false);
    }
  };

  useEffect(() => {
    if (authToken && isEmailExist) {
      getRevealQuestions(authToken);
    }
  }, [authToken, isEmailExist]);

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
  }, []);

  useEffect(() => {
    if (
      selectedRevealQuestions.length === questions.length &&
      questions.length !== 0
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedRevealQuestions, questions]);

  useEffect(() => {
    if (user) setIsLoading(false);

    if (primaryWallet) {
      setAddress(primaryWallet.address);
      getUserBalance();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (
      isVerificationSucceed &&
      isLoggedIn &&
      !user?.emails[0]?.address &&
      !user?.wallets[0]?.address
    ) {
      storeDynamicUser();
    }
  }, [isVerificationSucceed, isLoggedIn]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      {isLoggedIn && !burnSuccessfull && !isLoading && isEmailExist ? (
        <BotRevealClaim
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          wallet={address}
          userBalance={userBalance}
          isFetchingBalance={isFetchingBalance}
        >
          {activeTab === 0 ? (
            <RevealQuestionsFeed
              selectAll={selectAll}
              handleSelectAll={handleSelectAll}
              questions={questions}
              selectedRevealQuestions={selectedRevealQuestions}
              handleSelect={handleSelect}
              onBurn={onBurn}
              wallet={address}
              isQuestionsLoading={isLoadingQuestions}
              isBurnInProgress={isBurnInProgress}
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
      ) : !isEmailExist && isLoggedIn ? (
        <WalletCreatedInfo
          wallet={address}
          handleSetupComplete={() => {
            setIsEmailExist(true);
          }}
        />
      ) : isVerificationIsInProgress ? (
        <BotOtpAuth
          email={email}
          isEmailExist={isEmailExist}
          otp={otp}
          setOtp={setOtp}
          onSubmitOtpHandler={onSubmitOtpHandler}
        />
      ) : (
        <BotLogin
          email={email}
          setEmail={setEmail}
          isEmailExist={isEmailExist}
          isTermAccepted={isTermAccepted}
          setIsTermAccepted={setIsTermAccepted}
          onSubmitEmailHandler={onSubmitEmailHandler}
        />
      )}
    </>
  );
}
