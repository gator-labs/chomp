import { QuestionStep } from "@/types/question";

export const STEPS = [
  {
    text: "Every card poses a question. This one has two possible responses.",
    style: {
      bottom: "unset",
      top: "12%",
      left: "40%",
    },
    isQuestionCardTooltip: true,
    position: "bottom",
    questionActionStep: QuestionStep.AnswerQuestion,
    isTooltip: true,
  },
  {
    text: "You only have 1 minute to answer, clock’s ticking!",
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
    text: "Select the answer you agree with most.",
    style: {},
    position: "top",
    isQuestionCardTooltip: false,
    questionActionStep: QuestionStep.AnswerQuestion,
    isTooltip: true,
  },
  {
    text: "Use the slider to share how you think others answered this question.",
    style: {
      bottom: "70%",
      top: "unset",
    },
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
