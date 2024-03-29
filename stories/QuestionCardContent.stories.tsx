import type { Meta, StoryObj } from "@storybook/react";
import { QuestionCardContent } from "../app/components/QuestionCardContent/QuestionCardContent";

import { QuestionType } from "@prisma/client";
import { fn } from "@storybook/test";
import { QuestionStep } from "@/app/components/Question/Question";

const questionOptions = [
  { id: 1, option: "Answer" },
  { id: 2, option: "Answer" },
  { id: 3, option: "Answer" },
  { id: 4, option: "Answer" },
];

const meta = {
  title: "Cards/Question Card Content",
  component: QuestionCardContent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    questionOptions: questionOptions,
    onPercentageChanged: fn(),
    onOptionSelected: fn(),
  },
  decorators: (Story) => (
    <div className="bg-black w-96 p-5">
      <Story />
    </div>
  ),
} satisfies Meta<typeof QuestionCardContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleChoiceAnswer: Story = {
  args: {
    type: QuestionType.MultiChoice,
    step: QuestionStep.AnswerQuestion,
  },
};

export const MultipleChoiceAnswerSelected: Story = {
  args: {
    type: QuestionType.MultiChoice,
    step: QuestionStep.AnswerQuestion,
    optionSelectedId: 1,
  },
};

export const MultipleChoicePercentage: Story = {
  args: {
    type: QuestionType.MultiChoice,
    step: QuestionStep.PickPercentage,
    randomOptionId: 1,
    percentage: 50,
  },
};
