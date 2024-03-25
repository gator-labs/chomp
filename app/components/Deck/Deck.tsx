"use client";
import { QuestionType } from "@prisma/client";
import { QuestionCard } from "../QuestionCard/QuestionCard";
import { useCallback, useRef, useState } from "react";
import { NoQuestionsCard } from "../NoQuestionsCard/NoQuestionsCard";
import dayjs from "dayjs";

type Option = {
  id: number;
  option: string;
};

type Tag = {
  id: number;
  tag: string;
};

type Question = {
  id: number;
  durationMiliseconds: number;
  question: string;
  type: QuestionType;
  questionTags: Tag[];
  questionOptions: Option[];
};

type DeckProps = {
  questions: Question[];
};

enum Step {
  AnswerQuestion = 1,
  PickPercentage = 2,
}

const getSumOfDurations = (questions: Question[], index: number): Date => {
  let dueAt = dayjs(new Date());
  let itterator = 0;

  while (itterator <= index) {
    dueAt = dueAt.add(questions[itterator].durationMiliseconds, "milliseconds");
    itterator++;
  }

  return dueAt.toDate();
};

export function Deck({ questions }: DeckProps) {
  const questionsMapped = useRef(
    questions.map((q, index) => ({
      ...q,
      dueAt: getSumOfDurations(questions, index),
    }))
  );
  const [currentQuestionStep, setCurrentQuestionStep] = useState<Step>(
    Step.AnswerQuestion
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const onDurationRanOut = useCallback(() => {
    setCurrentQuestionIndex((index) => {
      const nextIndex = index + 1;

      if (nextIndex > questions.length - 1) {
        return questions.length - 1;
      }

      return nextIndex;
    });
  }, [setCurrentQuestionIndex]);

  if (questions.length === 0) {
    return (
      <div>
        <NoQuestionsCard />
      </div>
    );
  }

  const question = questions[currentQuestionIndex];

  return (
    <div>
      <div className="relative">
        {Array.from(
          Array(questions.length - (currentQuestionIndex + 1)).keys()
        ).map((index) => (
          <QuestionCard
            key={index}
            dueAt={questionsMapped.current[index].dueAt}
            numberOfSteps={2}
            question={questions[index].question}
            step={1}
            className="absolute drop-shadow-question-card border-opacity-40"
            style={{
              zIndex: 10 + questions.length + index,
              top: 15 * index + "%",
            }}
            isBlurred
          />
        ))}
        <QuestionCard
          dueAt={questionsMapped.current[currentQuestionIndex].dueAt}
          numberOfSteps={2}
          question={question.question}
          step={currentQuestionStep}
          onDurationRanOut={onDurationRanOut}
          className="z-50 relative drop-shadow-question-card border-opacity-40"
          style={{
            transform: `translateY(${15 * (questions.length - currentQuestionIndex - 1)}%)`,
          }}
        ></QuestionCard>
      </div>
    </div>
  );
}
