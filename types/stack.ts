import {
  Deck,
  DeckQuestion,
  Question,
  QuestionAnswer,
  QuestionOption,
  Stack,
} from "@prisma/client";

// Extended types with nested relationships
type ExtendedQuestionOption = QuestionOption & {
  questionAnswers: QuestionAnswer[];
};

type ExtendedQuestion = Question & {
  questionOptions: ExtendedQuestionOption[];
};

type ExtendedDeckQuestion = DeckQuestion & {
  question: ExtendedQuestion;
};

type ExtendedDeck = Deck & {
  deckQuestions: ExtendedDeckQuestion[];
  totalCreditCost: number;
  totalRewardAmount: number;
  totalQuestions: number;
  answeredQuestions: number;
};

export type ExtendedStack = Stack & {
  deck: ExtendedDeck[];
};
