import type { Meta, StoryObj } from "@storybook/react";
import { AnswerResult } from "../app/components/AnswerResult/AnswerResult";

const meta = {
  title: "Answer Result",
  component: AnswerResult,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {},
  decorators: (Story) => (
    <div className="w-52">
      <Story />
    </div>
  ),
} satisfies Meta<typeof AnswerResult>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    percentage: 80,
    answerText: "Answer",
  },
};
