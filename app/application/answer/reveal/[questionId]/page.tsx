import BackButton from "@/app/components/BackButton/BackButton";
import BestAnswerBinary from "@/app/components/BestAnswerBinary/BestAnswerBinary";
import BestAnswerMultipleChoice from "@/app/components/BestAnswerMultipleChoice/BestAnswerMultipleChoice";
import ClaimButton from "@/app/components/ClaimButton/ClaimButton";
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
import {
  BINARY_QUESTION_OPTION_LABELS,
  BINARY_QUESTION_TRUE_LABELS,
  getAlphaIdentifier,
} from "@/app/utils/question";
import { QuestionType, ResultType, TransactionStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: {
    questionId: string;
  };
}

const RevealAnswerPage = async ({ params }: Props) => {
  const [questionResponse, user] = await Promise.all([
    getQuestionWithUserAnswer(Number(params.questionId)),
    getCurrentUser(),
  ]);

  const sendTransactionSignature =
    questionResponse?.chompResults[0]?.sendTransactionSignature;

  if (!questionResponse) notFound();

  if (
    !questionResponse.isQuestionRevealable ||
    !questionResponse.correctAnswer ||
    questionResponse.chompResults[0]?.transactionStatus !==
      TransactionStatus.Completed
  ) {
    redirect("/application");
  }

  const isBinary = questionResponse.type === QuestionType.BinaryQuestion;
  const answerSelected = questionResponse.userAnswers.find((ua) => ua.selected);

  const isFirstOrderCorrect =
    questionResponse.correctAnswer?.id === answerSelected?.questionOptionId;
  const isSecondOrderCorrect =
    (questionResponse.chompResults[0]?.rewardTokenAmount ?? 0) >
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
          status={
            questionResponse.chompResults[0]?.result === ResultType.Revealed
              ? "claimable"
              : "claimed"
          }
          rewardAmount={
            questionResponse.chompResults[0]?.rewardTokenAmount ?? 0
          }
          questionIds={[questionResponse.id]}
          questions={[questionResponse.question]}
          revealAmount={questionResponse.revealTokenAmount}
        />
      )}
      {questionContent}
      {answerContent}
      <ClaimButton
        status={
          questionResponse.chompResults[0]?.result === ResultType.Revealed
            ? "claimable"
            : "claimed"
        }
        rewardAmount={questionResponse.chompResults[0]?.rewardTokenAmount ?? 0}
        didAnswer={!!answerSelected}
        questionIds={[questionResponse.id]}
        transactionHash={
          questionResponse.chompResults[0]?.burnTransactionSignature || ""
        }
        questions={[questionResponse.question]}
        revealNftId={questionResponse.chompResults[0].revealNftId}
        resultIds={questionResponse.chompResults.map((r) => r.id)}
        userId={questionResponse.chompResults[0].userId}
        creditsPerQuestion={questionResponse.creditCostPerQuestion}
      />
      {!!questionResponse.chompResults[0].rewardTokenAmount &&
        questionResponse.chompResults[0].burnTransactionSignature && (
          <ShareResult
            claimedAmount={questionResponse.chompResults[0].rewardTokenAmount!}
            options={questionResponse.questionOptions.map((qo) => ({
              id: qo.id,
              option: qo.option,
            }))}
            question={questionResponse.question}
            selectedOptionId={answerSelected?.questionOption?.id!}
            transactionHash={
              questionResponse.chompResults[0].burnTransactionSignature
            }
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
