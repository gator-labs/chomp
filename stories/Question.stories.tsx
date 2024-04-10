import type { Meta, StoryObj } from "@storybook/react";
import { Question } from "../app/components/Question/Question";
import { ONE_MINUTE_IN_MILISECONDS } from "../app/utils/dateUtils";
import { QuestionType } from "@prisma/client";

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

export const TrueFale: Story = {
  args: {
    question: {
      ...questionBase,
      type: QuestionType.TrueFalse,
      questionOptions: [
        {
          id: 1,
          option: "False",
        },
        { id: 2, option: "True" },
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
        { id: 1, option: "Answer" },
        { id: 2, option: "Answer" },
        { id: 3, option: "Answer" },
        { id: 4, option: "Answer" },
      ],
      question:
        "The best way to secure your assets is to use a software wallet.",
      questionTags: [],
    },
  },
};
