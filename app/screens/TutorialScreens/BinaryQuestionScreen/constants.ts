import { QuestionStep } from "@chomp/app/components/Question/Question";

export const STEPS = [
  {
    text: "Every card is a question. For each question, you will be asked to give two answers.",
    style: {
      bottom: "unset",
      top: "12%",
      left: "35%",
    },
    isQuestionCardTooltip: true,
    position: "bottom",
    questionActionStep: QuestionStep.AnswerQuestion,
    isTooltip: true,
  },
  {
    text: "You have 1 minute to give each answer, clock's ticking!",
    style: {
      bottom: "5%",
      top: "unset",
      left: "4%",
    },
    position: "top-start",
    isQuestionCardTooltip: true,
    questionActionStep: QuestionStep.AnswerQuestion,
    isTooltip: true,
  },
  {
    text: "Select the answer you agree with the most.",
    style: {},
    position: "top",
    isQuestionCardTooltip: false,
    questionActionStep: QuestionStep.AnswerQuestion,
    isTooltip: true,
  },
  {
    text: "Use the slider to share your best estimate of how the crowd would choose their answer.",
    style: {},
    position: "top",
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
