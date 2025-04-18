import { QuestionOption } from "@prisma/client";
import { ReactNode } from "react";

export type BestAnswerProps = {
  questionOptions: QuestionOption[];
  bestOption: string;
  optionSelected?: string | null;
};

export type UserResponseProps = {
  isUnanswered: boolean;
  isBestSelected: boolean;
  children?: ReactNode;
};

export type MultiChoiceFirstOrderAnswerProps = {
  bestOption: string;
  optionSelected?: string | null;
  totalAnswers: number;
  correctAnswers: number;
  selectionDistribution: {
    option: string;
    count: number;
  }[];
  questionOptions: QuestionOption[];
};

export type BinaryFirstOrderAnswerProps = {
  questionOptions: QuestionOption[];
  bestOption: string;
  optionSelected?: string | null;
  totalAnswers: number;
  correctAnswers: number;
};
