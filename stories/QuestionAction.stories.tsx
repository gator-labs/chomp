import type { Meta, StoryObj } from "@storybook/react";
import { QuestionAction } from "../app/components/QuestionAction/QuestionAction";
import { DeckStep } from "../app/components/Deck/Deck";

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
    <div className="bg-black w-96 p-5">
      <Story />
    </div>
  ),
} satisfies Meta<typeof QuestionAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TrueFalse: Story = {
  args: {
    type: QuestionType.TrueFalse,
    questionOptions: [
      { id: 1, option: "False" },
      { id: 2, option: "True" },
    ],
    step: DeckStep.AnswerQuestion,
  },
};

export const MultipleChoice: Story = {
  args: {
    type: QuestionType.MultiChoice,
    step: DeckStep.AnswerQuestion,
  },
};

export const TrueFalsePercentage: Story = {
  args: {
    type: QuestionType.TrueFalse,
    questionOptions: [
      { id: 1, option: "False" },
      { id: 2, option: "True" },
    ],
    step: DeckStep.PickPercentage,
  },
};

export const MultipleChoicePercentage: Story = {
  args: {
    type: QuestionType.MultiChoice,
    step: DeckStep.PickPercentage,
    randomQuestionMarker: "A",
  },
};
