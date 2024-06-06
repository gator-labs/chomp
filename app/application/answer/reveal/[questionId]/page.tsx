import BestAnswerBinary from "@/app/components/BestAnswerBinary/BestAnswerBinary";
import BestAnswerMultipleChoice from "@/app/components/BestAnswerMultipleChoice/BestAnswerMultipleChoice";
import ClaimButton from "@/app/components/ClaimButton/ClaimButton";
import { HalfArrowLeftIcon } from "@/app/components/Icons/HalfArrowLeftIcon";
import LikeIcon from "@/app/components/Icons/LikeIcon";
import UnlikeIcon from "@/app/components/Icons/UnlikeIcon";
import TopInfoBox from "@/app/components/InfoBoxes/RevealPage/TopInfoBox";
import PollResultBinary from "@/app/components/PollResultBinary/PollResultBinary";
import PollResultMultipleChoice from "@/app/components/PollResultMultipleChoice/PollResultMultipleChoice";
import QuestionAnswerLabel from "@/app/components/QuestionAnswerLabel/QuestionAnswerLabel";
import QuestionAnswerPreviewBinary from "@/app/components/QuestionAnswerPreviewBinary/QuestionAnswerPreviewBinary";
import QuestionAnswerPreviewMultipleChoice from "@/app/components/QuestionAnswerPreviewMultipleChoice/QuestionAnswerPreviewMultipleChoice";
import RewardShow from "@/app/components/RewardShow/RewardShow";
import { getProfileImage } from "@/app/queries/profile";
import { getQuestionWithUserAnswer } from "@/app/queries/question";
import { getAlphaIdentifier, isEntityRevealable } from "@/app/utils/question";
import { QuestionType, ResultType } from "@prisma/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: {
    questionId: string;
  };
}

const RevealAnswerPage = async ({ params }: Props) => {
  const questionResponse = await getQuestionWithUserAnswer(
    Number(params.questionId),
  );
  const profile = await getProfileImage();

  if (!questionResponse) notFound();

  const isQuestionRevealable = isEntityRevealable({
    revealAtAnswerCount: questionResponse.revealAtAnswerCount,
    revealAtDate: questionResponse.revealAtDate,
    answerCount: questionResponse.questionOptions[0].questionAnswers.length,
  });

  if (!isQuestionRevealable) redirect("/application");

  const isBinary = questionResponse.type === QuestionType.BinaryQuestion;
  const optionSelected = questionResponse.userAnswers.find((ua) => ua.selected);

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
      {!!optionSelected && (
        <RewardShow
          rewardAmount={
            questionResponse.chompResults[0]?.rewardTokenAmount ?? 0
          }
        />
      )}
      {isBinary ? (
        <QuestionAnswerPreviewBinary
          question={questionResponse.question}
          optionSelected={optionSelected?.questionOption.option ?? ""}
          answerCount={questionResponse.answerCount}
          revealAtAnswerCount={
            questionResponse.revealAtAnswerCount ?? undefined
          }
          revealAtDate={questionResponse.revealAtDate ?? undefined}
          viewImageSrc={questionResponse.imageUrl ?? undefined}
        />
      ) : (
        <QuestionAnswerPreviewMultipleChoice
          question={questionResponse.question}
          optionSelectedId={optionSelected?.questionOption.id ?? 0}
          answerCount={questionResponse.answerCount}
          revealAtAnswerCount={
            questionResponse.revealAtAnswerCount ?? undefined
          }
          revealAtDate={questionResponse.revealAtDate ?? undefined}
          viewImageSrc={questionResponse.imageUrl ?? undefined}
          options={questionResponse.questionOptions.map((qo) => ({
            id: qo.id,
            option: qo.option,
          }))}
        />
      )}
      <div>
        <QuestionAnswerLabel label="Question 1" />
      </div>
      {isBinary ? (
        <BestAnswerBinary
          icon={
            questionResponse.correctAnswer?.isLeft ? (
              <LikeIcon />
            ) : (
              <UnlikeIcon />
            )
          }
          bestOption={questionResponse.correctAnswer?.option ?? ""}
          optionSelected={optionSelected?.questionOption?.option ?? ""}
        />
      ) : (
        <BestAnswerMultipleChoice
          optionLabel={questionResponse.correctAnswer?.option ?? ""}
          bestOption={questionResponse.correctAnswer?.option ?? ""}
          optionSelected={optionSelected?.questionOption?.option ?? ""}
        />
      )}
      <div>
        <QuestionAnswerLabel label="Question 2" />
      </div>
      {isBinary ? (
        <PollResultBinary
          leftOption={{
            option:
              questionResponse.questionOptionPercentages.find(
                (qop) => qop.isLeft,
              )?.option ?? "",
            percentage:
              questionResponse.questionOptionPercentages.find(
                (qop) => qop.isLeft,
              )?.percentageResult ?? 0,
          }}
          rightOption={{
            option:
              questionResponse.questionOptionPercentages.find(
                (qop) => !qop.isLeft,
              )?.option ?? "",
            percentage:
              questionResponse.questionOptionPercentages.find(
                (qop) => !qop.isLeft,
              )?.percentageResult ?? 0,
          }}
          optionSelected={optionSelected?.questionOption.option ?? ""}
          percentageSelected={optionSelected?.percentage ?? 0}
          avatarSrc={profile}
        />
      ) : (
        <PollResultMultipleChoice
          options={questionResponse.questionOptionPercentages.map(
            (qop, index) => ({
              option: qop.option ?? "",
              label: getAlphaIdentifier(index),
              percentage: qop.percentageResult,
            }),
          )}
          optionSelected={optionSelected?.questionOption.option ?? ""}
          percentageSelected={optionSelected?.percentage ?? 0}
          avatarSrc={profile}
        />
      )}
      <ClaimButton
        status={
          questionResponse.chompResults[0]?.result === ResultType.Revealed
            ? "claimable"
            : "claimed"
        }
        rewardAmount={questionResponse.chompResults[0]?.rewardTokenAmount ?? 0}
        didAnswer={!!optionSelected}
        questionIds={[questionResponse.id]}
      />
    </div>
  );
};

export default RevealAnswerPage;
