import type { Meta, StoryObj } from "@storybook/react";

import { AnswerResult } from "../app/components/AnswerResult/AnswerResult";
import AvatarSample from "./assets/avatar_sample.png";

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
    index: 1,
    percentage: 80,
    answerText: "Answer",
  },
};

export const ValueSelected: Story = {
  args: {
    index: 1,
    percentage: 40,
    answerText: "Answer",
    avatarSrc: AvatarSample.src,
    valueSelected: 80,
  },
};
