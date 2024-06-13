import { QuestionType } from "@prisma/client";
import type { Meta, StoryObj } from "@storybook/react";
import { Question } from "../app/components/Question/Question";
import {
  ONE_HOUR_IN_MILISECONDS,
  ONE_MINUTE_IN_MILISECONDS,
} from "../app/utils/dateUtils";

const questionBase = {
  id: 1,
  durationMiliseconds: ONE_MINUTE_IN_MILISECONDS / 4,
  questionTags: [
    { id: 1, tag: "Defi" },
    { id: 2, tag: "Not defi" },
  ],
};

const meta = {
  title: "Cards/Question",
  component: Question,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  args: {
    returnUrl: "/application",
  },
  decorators: (Story) => (
    <div className="bg-black p-10">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Question>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TrueFalse: Story = {
  args: {
    question: {
      ...questionBase,
      type: QuestionType.BinaryQuestion,
      questionOptions: [
        {
          id: 1,
          option: "False",
          isLeft: false,
        },
        { id: 2, option: "True", isLeft: true },
      ],
      question:
        "The best way to secure your assets is to use a hardware wallet.",
      questionTags: [],
    },
  },
};

export const MultipleChoice: Story = {
  args: {
    question: {
      ...questionBase,
      type: QuestionType.MultiChoice,
      questionOptions: [
        { id: 1, option: "Answer", isLeft: false },
        { id: 2, option: "Answer", isLeft: false },
        { id: 3, option: "Answer", isLeft: false },
        { id: 4, option: "Answer", isLeft: false },
      ],
      question:
        "The best way to secure your assets is to use a software wallet.",
      questionTags: [],
    },
  },
};

export const Cramped: Story = {
  args: {
    question: {
      ...questionBase,
      durationMiliseconds: ONE_HOUR_IN_MILISECONDS,
      type: QuestionType.BinaryQuestion,
      questionOptions: [
        {
          id: 1,
          option: "False",
          isLeft: false,
        },
        { id: 2, option: "True", isLeft: true },
      ],
      question:
        "The best way to secure your assets is to use a hardware wallet.",
      questionTags: [],
    },
  },
  decorators: (Story) => (
    <div className="bg-black h-80 overflow-y-auto">
      <Story />
    </div>
  ),
};
