import type { Meta, StoryObj } from "@storybook/react";
import { QuestionAction } from "../app/components/QuestionAction/QuestionAction";

import { QuestionStep } from "@/app/components/Question/Question";
import { QuestionType } from "@prisma/client";
import { fn } from "@storybook/test";

const meta = {
  title: "Cards/Question Action",
  component: QuestionAction,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onButtonClick: fn(),
  },
  decorators: (Story) => (
    <div className="bg-gray-800 w-96 p-5">
      <Story />
    </div>
  ),
} satisfies Meta<typeof QuestionAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TrueFalse: Story = {
  args: {
    type: QuestionType.BinaryQuestion,
    questionOptions: [
      { id: 1, option: "False", isLeft: false },
      { id: 2, option: "True", isLeft: true },
    ],
    step: QuestionStep.AnswerQuestion,
  },
};

export const MultipleChoice: Story = {
  args: {
    type: QuestionType.MultiChoice,
    step: QuestionStep.AnswerQuestion,
  },
};

export const TrueFalsePercentage: Story = {
  args: {
    type: QuestionType.BinaryQuestion,
    questionOptions: [
      { id: 1, option: "False", isLeft: false },
      { id: 2, option: "True", isLeft: true },
    ],
    step: QuestionStep.PickPercentage,
  },
};

export const MultipleChoicePercentage: Story = {
  args: {
    type: QuestionType.MultiChoice,
    step: QuestionStep.PickPercentage,
    randomQuestionMarker: "A",
  },
};
