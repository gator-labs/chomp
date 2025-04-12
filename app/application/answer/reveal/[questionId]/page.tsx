import BackButton from "@/app/components/BackButton/BackButton";
import BestAnswerBinary from "@/app/components/BestAnswerBinary/BestAnswerBinary";
import BestAnswerMultipleChoice from "@/app/components/BestAnswerMultipleChoice/BestAnswerMultipleChoice";
import LikeIcon from "@/app/components/Icons/LikeIcon";
import { OpenLinkIcon } from "@/app/components/Icons/OpenLinkIcon";
import UnlikeIcon from "@/app/components/Icons/UnlikeIcon";
import TopInfoBox from "@/app/components/InfoBoxes/RevealPage/TopInfoBox";
import PollResultBinary from "@/app/components/PollResultBinary/PollResultBinary";
import PollResultMultipleChoice from "@/app/components/PollResultMultipleChoice/PollResultMultipleChoice";
import QuestionAnswerLabel from "@/app/components/QuestionAnswerLabel/QuestionAnswerLabel";
import QuestionAnswerPreviewBinary from "@/app/components/QuestionAnswerPreviewBinary/QuestionAnswerPreviewBinary";
import QuestionAnswerPreviewMultipleChoice from "@/app/components/QuestionAnswerPreviewMultipleChoice/QuestionAnswerPreviewMultipleChoice";
import RewardShow from "@/app/components/RewardShow/RewardShow";
import ShareResult from "@/app/components/ShareResult/ShareResult";
import { SOLSCAN_BASE_TRANSACTION_LINK } from "@/app/constants/solscan";
import { getQuestionWithUserAnswer } from "@/app/queries/question";
import { getCurrentUser } from "@/app/queries/user";
import { getRevealAtText } from "@/app/utils/history";
import {
  BINARY_QUESTION_OPTION_LABELS,
  BINARY_QUESTION_TRUE_LABELS,
  getAlphaIdentifier,
} from "@/app/utils/question";
import ViewRewardsButton from "@/components/ViewRewardsButton";
import { EBoxPrizeType, QuestionType, ResultType } from "@prisma/client";
import { isPast } from "date-fns";
import { notFound } from "next/navigation";

interface Props {
  params: {
    questionId: string;
  };
}

const NotAvailableYet = ({ msg }: { msg: string }) => {
  return (
    <div className="py-2 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 justify-start">
          <BackButton />
          <h4 className="text-sm font-normal text-left">
            Viewing answer results
          </h4>
        </div>
      </div>
      <div className="py-6">{msg}</div>
    </div>
  );
};

const RevealAnswerPage = async ({ params }: Props) => {
  // Parameters can be undefined on the first render;
  // return a promise to trigger suspense further up
  // the tree until we have the values.
  if (params.questionId === undefined)
    throw new Promise((r) => setTimeout(r, 0));

  const [questionResponse, user] = await Promise.all([
    getQuestionWithUserAnswer(Number(params.questionId)),
    getCurrentUser(),
  ]);

  if (!questionResponse) notFound();

  const FF_CREDITS =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION == "true";
  const isCreditsQuestion =
    FF_CREDITS && questionResponse.creditCostPerQuestion !== null;

  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";
  const creditsPrize =
    questionResponse.MysteryBoxTrigger[0]?.MysteryBoxPrize.find(
      (prize) => prize.prizeType == EBoxPrizeType.Credits,
    );

  const bonkPrizes =
    questionResponse.MysteryBoxTrigger[0]?.MysteryBoxPrize.filter(
      (prize) =>
        prize.prizeType == EBoxPrizeType.Token &&
        prize.tokenAddress == bonkAddress,
    );

  const bonkPrizeAmount = bonkPrizes?.reduce(
    (total, prize) => total + Number(prize.amount ?? 0),
    0,
  );

  const chompResult = isCreditsQuestion
    ? {
      result: ResultType.Revealed,
      rewardTokenAmount: bonkPrizeAmount,
      revealNftId: null,
      burnTransactionSignature: null,
      sendTransactionSignature: null,
      userId: user?.id ?? "",
    }
    : questionResponse.chompResults.length > 0
      ? questionResponse.chompResults?.[0]
      : {
        result: ResultType.Revealed,
        rewardTokenAmount: 0,
        revealNftId: null,
        burnTransactionSignature: null,
        sendTransactionSignature: null,
        userId: user?.id ?? "",
      };

  const hasAlreadyClaimedReward =
    !isCreditsQuestion || questionResponse.MysteryBoxTrigger.length > 0;

  const sendTransactionSignature =
    chompResult?.sendTransactionSignature ?? null;

  const isPracticeQuestion = questionResponse.creditCostPerQuestion === 0;

  if (!questionResponse.isQuestionRevealable) {
    if (
      questionResponse.revealAtDate === null ||
      isPast(questionResponse.revealAtDate)
    ) {
      return <NotAvailableYet msg={"Question not revealed yet."} />;
    } else {
      return (
        <NotAvailableYet
          msg={`Question not revealed yet. ${getRevealAtText(questionResponse.revealAtDate)}.`}
        />
      );
    }
  }

  const isBinary = questionResponse.type === QuestionType.BinaryQuestion;
  const answerSelected = questionResponse.userAnswers.find((ua) => ua.selected);

  const isFirstOrderCorrect =
    questionResponse.correctAnswer?.id === answerSelected?.questionOptionId;

  const isSecondOrderCorrect = isCreditsQuestion
    ? hasAlreadyClaimedReward
      ? bonkPrizeAmount > 0
      : undefined
    : (chompResult?.rewardTokenAmount ?? 0) >
    questionResponse.revealTokenAmount;

  let questionContent = <></>;

  if (isBinary) {
    questionContent = (
      <QuestionAnswerPreviewBinary
        question={questionResponse.question}
        optionSelected={answerSelected?.questionOption.option ?? ""}
        answerCount={questionResponse.answerCount}
        revealAtAnswerCount={questionResponse.revealAtAnswerCount ?? undefined}
        revealAtDate={questionResponse.revealAtDate ?? undefined}
        viewImageSrc={questionResponse.imageUrl ?? undefined}
      />
    );
  }

  if (!isBinary) {
    questionContent = (
      <QuestionAnswerPreviewMultipleChoice
        question={questionResponse.question}
        optionSelectedId={answerSelected?.questionOption.id ?? 0}
        answerCount={questionResponse.answerCount}
        revealAtAnswerCount={questionResponse.revealAtAnswerCount ?? undefined}
        revealAtDate={questionResponse.revealAtDate ?? undefined}
        viewImageSrc={questionResponse.imageUrl ?? undefined}
        options={questionResponse.questionOptions.map((qo) => ({
          id: qo.id,
          option: qo.option,
        }))}
      />
    );
  }

  let answerContent = <></>;

  if (!!answerSelected && isBinary) {
    let bestAnswerIcon = <></>;

    if (
      BINARY_QUESTION_OPTION_LABELS.includes(
        answerSelected.questionOption?.option,
      )
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      bestAnswerIcon = BINARY_QUESTION_TRUE_LABELS.includes(
        questionResponse.correctAnswer?.option ?? "",
      ) ? (
        <LikeIcon />
      ) : (
        <UnlikeIcon />
      );
    }

    answerContent = (
      <>
        <div>
          <QuestionAnswerLabel
            label="1st Order Answer"
            isCorrect={isFirstOrderCorrect}
          />
        </div>
        <BestAnswerBinary
          bestOption={questionResponse.correctAnswer?.option ?? ""}
          optionSelected={answerSelected?.questionOption?.option ?? ""}
        />
        <div>
          <QuestionAnswerLabel
            label="2nd Order Answer"
            isCorrect={isSecondOrderCorrect}
          />
        </div>
        <PollResultBinary
          leftOption={{
            option:
              questionResponse.questionOptionPercentages.find(
                (qop) => qop.isLeft,
              )?.option ?? "",
            percentage:
              questionResponse.questionOptionPercentages.find(
                (qop) => qop.isLeft,
              )?.secondOrderAveragePercentagePicked ?? 0,
          }}
          rightOption={{
            option:
              questionResponse.questionOptionPercentages.find(
                (qop) => !qop.isLeft,
              )?.option ?? "",
            percentage:
              questionResponse.questionOptionPercentages.find(
                (qop) => !qop.isLeft,
              )?.secondOrderAveragePercentagePicked ?? 0,
          }}
          optionSelected={answerSelected.questionOption.option ?? ""}
          percentageSelected={answerSelected.percentage ?? 0}
          isCorrect={isSecondOrderCorrect}
          avatarSrc={user?.profileSrc || ""}
        />
      </>
    );
  }

  if (!!answerSelected && !isBinary) {
    const optionSelected = questionResponse.userAnswers.find(
      (ua) => ua.percentage !== null,
    );

    answerContent = (
      <>
        <div>
          <QuestionAnswerLabel
            label="Question 1"
            isCorrect={isFirstOrderCorrect}
          />
        </div>
        <BestAnswerMultipleChoice
          optionLabel={questionResponse.correctAnswer?.option ?? ""}
          bestOption={questionResponse.correctAnswer?.option ?? ""}
          optionSelected={answerSelected.questionOption?.option ?? ""}
        />
        <div>
          <QuestionAnswerLabel
            label="Question 2"
            isCorrect={isSecondOrderCorrect}
          />
        </div>
        <PollResultMultipleChoice
          options={questionResponse.questionOptionPercentages.map(
            (qop, index) => ({
              option: qop.option ?? "",
              label: getAlphaIdentifier(index),
              percentage: qop.secondOrderAveragePercentagePicked,
            }),
          )}
          optionSelected={optionSelected?.questionOption.option ?? ""}
          percentageSelected={optionSelected?.percentage ?? 0}
          isCorrect={isSecondOrderCorrect}
          avatarSrc={user?.profileSrc || ""}
        />
      </>
    );
  }

  if (!answerSelected && isBinary) {
    answerContent = (
      <>
        <BestAnswerBinary
          bestOption={questionResponse.correctAnswer?.option ?? ""}
        />
        <PollResultBinary
          leftOption={{
            option:
              questionResponse.questionOptionPercentages.find(
                (qop) => qop.isLeft,
              )?.option ?? "",
            percentage:
              questionResponse.questionOptionPercentages.find(
                (qop) => qop.isLeft,
              )?.secondOrderAveragePercentagePicked ?? 0,
          }}
          rightOption={{
            option:
              questionResponse.questionOptionPercentages.find(
                (qop) => !qop.isLeft,
              )?.option ?? "",
            percentage:
              questionResponse.questionOptionPercentages.find(
                (qop) => !qop.isLeft,
              )?.secondOrderAveragePercentagePicked ?? 0,
          }}
        />
      </>
    );
  }

  if (!answerSelected && !isBinary) {
    answerContent = (
      <>
        <BestAnswerMultipleChoice
          optionLabel={questionResponse.correctAnswer?.option ?? ""}
          bestOption={questionResponse.correctAnswer?.option ?? ""}
        />
        <PollResultMultipleChoice
          options={questionResponse.questionOptionPercentages.map(
            (qop, index) => ({
              option: qop.option ?? "",
              label: getAlphaIdentifier(index),
              percentage: qop.secondOrderAveragePercentagePicked,
            }),
          )}
        />
      </>
    );
  }

  return (
    <div className="py-2 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 justify-start">
          <BackButton />
          <h4 className="text-sm font-normal text-left">
            Viewing answer results
          </h4>
        </div>
        <TopInfoBox />
      </div>
      {!!answerSelected && (
        <RewardShow
          status={"claimed"}
          isCreditsQuestion={isCreditsQuestion}
          isFirstOrderCorrect={isFirstOrderCorrect}
          isSecondOrderCorrect={isSecondOrderCorrect}
          rewardAmount={chompResult?.rewardTokenAmount ?? 0}
          questionIds={[questionResponse.id]}
          questions={[questionResponse.question]}
          revealAmount={questionResponse.revealTokenAmount}
          creditsRewardAmount={creditsPrize?.amount}
          isPracticeQuestion={isPracticeQuestion}
        />
      )}
      {questionContent}
      {answerContent}
      {!isPracticeQuestion && (
        <ViewRewardsButton
          disabled={!isFirstOrderCorrect || hasAlreadyClaimedReward}
        />
      )}
      {!!chompResult.rewardTokenAmount &&
        chompResult.burnTransactionSignature && (
          <ShareResult
            claimedAmount={chompResult.rewardTokenAmount!}
            options={questionResponse.questionOptions.map((qo) => ({
              id: qo.id,
              option: qo.option,
            }))}
            question={questionResponse.question}
            selectedOptionId={answerSelected?.questionOption?.id!}
            transactionHash={chompResult.burnTransactionSignature}
            imageUrl={questionResponse.imageUrl!}
            questionId={questionResponse.id}
          />
        )}
      {sendTransactionSignature && (
        <a
          className="text-sm font-bold underline flex items-center justify-center gap-1 w-fit mx-auto"
          href={`${SOLSCAN_BASE_TRANSACTION_LINK}/${sendTransactionSignature}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View transaction
          <OpenLinkIcon />
        </a>
      )}
    </div>
  );
};

export default RevealAnswerPage;
