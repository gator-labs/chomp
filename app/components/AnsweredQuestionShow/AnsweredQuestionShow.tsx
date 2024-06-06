"use client";
import { QuestionType } from "@prisma/client";
import { Button } from "../Button/Button";
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
      {question.type === QuestionType.BinaryQuestion && (
        <div className="flex flex-col gap-2">
          <p className="text-sm">Coming Soon 🚀</p>
          <p className="text-sm">
            You might be curious what others have picked as their answers, and
            you&apos;re not alone!
          </p>
          <p className="text-sm">
            We are working on showing you how close your 2nd-order-answer is to
            the actual community sentiment.
          </p>
          <p className="text-sm">
            {" "}
            Check back here in a few days to see more😉
          </p>
        </div>
      )}
    </div>
  );
};

export default AnsweredQuestionShow;
