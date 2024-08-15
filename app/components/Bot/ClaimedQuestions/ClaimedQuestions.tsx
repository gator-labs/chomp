"use client";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { getRevealedAtString } from "../../../utils/dateUtils";
import { Button } from "../../Button/Button";
import { ClockIcon } from "../../Icons/ClockIcon";

type Question = {
  id: number;
  userId: string;
  questionId: number;
  deckId: number | null;
  burnTransactionSignature: string;
  sendTransactionSignature: string | null;
  rewardTokenAmount: string;
  result: string;
  createdAt: Date;
  updatedAt: string;
  transactionStatus: string;
};

type RevealQuestionCardProps = {
  questions: Question[];
};

export default function ClaimedQuestions({
  questions,
}: RevealQuestionCardProps) {
  const totalRewardAmount = questions?.reduce(
    (total, question) => total + Number(question.rewardTokenAmount),
    0,
  );
  const numberOfQuestionsWithReward = questions?.filter(
    (question) => Number(question.rewardTokenAmount) > 0,
  ).length;

  const handleClose = () => {
    if (window.Telegram) {
      window.Telegram.WebApp.close();
    }
  };
  // const router = useRouter();

  // const handleClick = (questionId: number) => {
  //     router.push(`/application/answer/reveal/${questionId}`);
  // };

  return (
    <div className="mx-4 mt-4">
      <p className="text-2xl font-bold mt-4">
        You revealed {questions.length} cards
      </p>

      <p className="text-left my-4">
        You&apos;ve recieved reward for {numberOfQuestionsWithReward}{" "}
        {numberOfQuestionsWithReward > 1 ? "cards" : "card"}, with the total
        amount of{" "}
        {numberToCurrencyFormatter.format(Math.floor(totalRewardAmount))} $BONK
        automatically transfered to your wallet.
      </p>
      {questions.length > 0 ? (
        questions.map((questionData, index) => (
          <div
            key={index} // Add key for list items
            className="flex flex-col bg-neutral-800 border border-neutral-600 rounded-2xl p-4 gap-2 my-2"
            // onClick={() => handleClick(questionData.id)}
          >
            <span className="flex gap-3 items-center">
              <p>{questionData.result}</p>
            </span>
            <div className="flex items-center justify-between">
              <span className="flex gap-1 items-center">
                <ClockIcon /> {getRevealedAtString(questionData.createdAt)}
              </span>
              <p
                className={
                  Number(questionData?.rewardTokenAmount) === 0
                    ? "text-[#DD7944]"
                    : "text-emerald-400"
                }
              >
                {" "}
                {Number(questionData?.rewardTokenAmount) === 0 ? (
                  "No rewards"
                ) : (
                  <>
                    {numberToCurrencyFormatter.format(
                      Math.floor(Number(questionData?.rewardTokenAmount)),
                    )}{" "}
                    $BONK
                  </>
                )}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>No claimed Question found. Keep Chomping!</p>
      )}
      <Button
        variant="purple"
        size="normal"
        className="gap-2 text-black font-medium mt-4"
        onClick={handleClose}
        isFullWidth
      >
        Continue Chomping
      </Button>
    </div>
  );
}
