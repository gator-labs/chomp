"use client";
import { QuestionCard } from "../QuestionCard/QuestionCard";
import { QuestionCardContent } from "../QuestionCardContent/QuestionCardContent";

const AnsweredQuestionShow = ({ question }: any) => {
  return (
    <QuestionCard
      question={question.question}
      type={question.type}
      step={1}
      numberOfSteps={1}
      viewImageSrc={question.imageUrl}
      dueAt={question.revealAtDate}
      isForReveal={true}
      answer={question.userAnswer.questionOption.option}
      className={`${question.type === "BinaryQuestion" && "!min-h-[216px] !h-[216px]"}`}
    >
      {question.type === "MultiChoice" && (
        <QuestionCardContent
          type={question.type}
          questionOptions={question.questionOptions}
          optionSelectedId={question.userAnswer.questionOptionId}
          step={1}
          onOptionSelected={() => {}}
        />
      )}
    </QuestionCard>
  );
};

export default AnsweredQuestionShow;
