import { QuestionStep } from "@chomp/app/components/Question/Question";

export const STEPS = [
  {
    text: "Pick the answer you agree with the most.",
    style: {
      bottom: "80px",
      left: "0%",
    },
    isQuestionCardTooltip: true,
    position: "bottom-start",
    questionActionStep: QuestionStep.AnswerQuestion,
    isTooltip: true,
  },
  {
    text: "How many people do you think chose this B choice?",
    style: {},
    position: "top-start",
    isQuestionCardTooltip: false,
    questionActionStep: QuestionStep.PickPercentage,
    isTooltip: true,
  },
  {
    text: "",
    style: {},
    position: "top",
    isQuestionCardTooltip: false,
    questionActionStep: QuestionStep.PickPercentage,
    isTooltip: false,
  },
];

export const SELECTED_OPTION = {
  1: "A",
  2: "B",
  3: "C",
  4: "D",
};
