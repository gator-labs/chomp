import type { Meta, StoryObj } from "@storybook/react";
import { QuestionAction } from "../app/components/QuestionAction/QuestionAction";

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
    onAnswer: fn(),
  },
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
  },
};
