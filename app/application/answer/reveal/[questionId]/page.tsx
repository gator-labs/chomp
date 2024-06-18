import BestAnswerBinary from "@/app/components/BestAnswerBinary/BestAnswerBinary";
import BestAnswerMultipleChoice from "@/app/components/BestAnswerMultipleChoice/BestAnswerMultipleChoice";
import ClaimButton from "@/app/components/ClaimButton/ClaimButton";
import { HalfArrowLeftIcon } from "@/app/components/Icons/HalfArrowLeftIcon";
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
import { SOLSCAN_BASE_TRANSACTION_LINK } from "@/app/constants/solscan";
import { getProfileImage } from "@/app/queries/profile";
import { getQuestionWithUserAnswer } from "@/app/queries/question";
import {
  BINARY_QUESTION_OPTION_LABELS,
  BINARY_QUESTION_TRUE_LABELS,
  getAlphaIdentifier,
} from "@/app/utils/question";
import { QuestionType, ResultType } from "@prisma/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: {
    questionId: string;
  };
}

const BONK_REWARD_AMOUNT_FOR_FIRST_ORDER_CORRECT = 5000;

const RevealAnswerPage = async ({ params }: Props) => {
  const questionResponse = await getQuestionWithUserAnswer(
    Number(params.questionId),
  );
  const profile = await getProfileImage();

  const sendTransactionSignature =
    questionResponse?.chompResults[0]?.sendTransactionSignature;

  if (!questionResponse) notFound();

  if (
    !questionResponse.isQuestionRevealable ||
    !questionResponse.correctAnswer ||
    !questionResponse.chompResults[0]
  ) {
    redirect("/application");
  }

  const isBinary = questionResponse.type === QuestionType.BinaryQuestion;
  const answerSelected = questionResponse.userAnswers.find((ua) => ua.selected);

  const isFirstOrderCorrect =
    questionResponse.correctAnswer?.id === answerSelected?.questionOptionId;
  const isSecondOrderCorrect =
    (questionResponse.chompResults[0]?.rewardTokenAmount ?? 0) >
    BONK_REWARD_AMOUNT_FOR_FIRST_ORDER_CORRECT;
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
            label="Question 1"
            isCorrect={isFirstOrderCorrect}
          />
        </div>
        <BestAnswerBinary
          icon={bestAnswerIcon}
          bestOption={questionResponse.correctAnswer?.option ?? ""}
          optionSelected={answerSelected.questionOption?.option ?? ""}
        />
        <div>
          <QuestionAnswerLabel
            label="Question 2"
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
          avatarSrc={profile}
        />
      </>
    );
  }

  if (!!answerSelected && !isBinary) {
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
          optionSelected={answerSelected.questionOption.option ?? ""}
          percentageSelected={answerSelected.percentage ?? 0}
          isCorrect={isSecondOrderCorrect}
          avatarSrc={profile}
        />
      </>
    );
  }

  if (!answerSelected && isBinary) {
    answerContent = (
      <>
        <BestAnswerBinary
          icon={
            questionResponse.correctAnswer?.isLeft ? (
              <LikeIcon />
            ) : (
              <UnlikeIcon />
            )
          }
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
          <Link href="/application">
            <HalfArrowLeftIcon />
          </Link>
          <h4 className="text-[13px] font-normal leading-[13px] text-left">
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
      />
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
