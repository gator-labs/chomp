import QuestionAnswerLabel from "@/app/components/QuestionAnswerLabel/QuestionAnswerLabel";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Reveal/Question answer label",
  component: QuestionAnswerLabel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof QuestionAnswerLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Correct: Story = {
  args: {
    label: "Question 1",
    isCorrect: true,
  },
};

export const Incorrect: Story = {
  args: {
    label: "Question 1",
    isCorrect: false,
  },
};
