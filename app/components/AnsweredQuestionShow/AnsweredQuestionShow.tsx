"use client";
import { QuestionType } from "@prisma/client";
import { Button } from "../Button/Button";
import LikeIcon from "../Icons/LikeIcon";
import UnlikeIcon from "../Icons/UnlikeIcon";
import { QuestionCard } from "../QuestionCard/QuestionCard";
import { QuestionCardContent } from "../QuestionCardContent/QuestionCardContent";

const AnsweredQuestionShow = ({ question }: any) => {
  return (
    <div className="flex flex-col gap-4">
      <QuestionCard
        question={question.question}
        type={question.type}
        viewImageSrc={question.imageUrl}
        dueAt={question.revealAtDate}
        isForReveal={true}
        answer={question.userAnswer?.questionOption?.option}
        className={`${question.type === "BinaryQuestion" && "!min-h-[216px] !h-[216px]"}`}
      >
        {question.type === "MultiChoice" && (
          <QuestionCardContent
            type={question.type}
            questionOptions={question.questionOptions}
            optionSelectedId={
              question.userAnswer?.questionOptionId || question.correctAnswer.id
            }
            step={1}
            onOptionSelected={() => {}}
            className="reveal-page-content"
            showRevealData
          />
        )}
      </QuestionCard>
      {!question.userAnswer &&
        !!question.correctAnswer &&
        question.type === QuestionType.BinaryQuestion && (
          <div className="flex flex-col gap-2 bg-[#333333] p-4 rounded-lg">
            <p className="text-base">Correct Answer</p>
            <Button variant="aqua" className="items-center gap-1 h-[50px]">
              {question.correctAnswer?.option}
            </Button>
          </div>
        )}
      {!question.userAnswer &&
        question.type === QuestionType.BinaryQuestion && (
          <div className="flex flex-col gap-2 bg-[#333333] p-4 rounded-lg">
            <p className="text-base">Poll Results</p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-[14px]">
                <div className="p-2 bg-[#4D4D4D] rounded-lg">
                  <LikeIcon fill="#fff" />
                </div>
                <div className="flex-1 border-[1px] border-[#666666] rounded-lg items-center flex relative overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 w-[${
                      (question.questionOptions[0]?.questionAnswers.length /
                        question.answerCount) *
                        100 || 0
                    }%] bg-[#4D4D4D] h-full`}
                  />
                  <p className="flex items-center gap-1 text-sm pl-4 z-10">
                    {(question.questionOptions[0]?.questionAnswers.length /
                      question.answerCount) *
                      100 || 0}
                    % answered{" "}
                    <span className="px-2 py-1 bg-white flex items-center justify-center rounded-3xl text-xs text-[#0D0D0D] font-bold">
                      {question.questionOptions[0].option}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-[14px]">
                <div className="p-2 bg-[#4D4D4D] rounded-lg">
                  <UnlikeIcon fill="#fff" />
                </div>
                <div className="flex-1 border-[1px] border-[#666666] rounded-lg items-center flex">
                  <div
                    className={`absolute top-0 left-0 w-[${
                      (question.questionOptions[1]?.questionAnswers.length /
                        question.answerCount) *
                        100 || 0
                    }%] bg-[#4D4D4D] h-full`}
                  />
                  <p className="flex items-center gap-1 text-sm pl-4">
                    {(question.questionOptions[1]?.questionAnswers.length /
                      question.answerCount) *
                      100 || 0}
                    % answered{" "}
                    <span className="px-2 py-1 bg-white flex items-center justify-center rounded-3xl text-xs text-[#0D0D0D] font-bold">
                      {question.questionOptions[1]?.option}
                    </span>
                  </p>
                </div>
              </div>{" "}
            </div>
          </div>
        )}
    </div>
  );
};

export default AnsweredQuestionShow;
