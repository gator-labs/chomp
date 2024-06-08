import { RevealFeedQuestionCard } from "@chomp/app/components/RevealFeedQuestionCard/RevealFeedQuestionCard";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";

const meta = {
  title: "Cards/Reveal Feed Question card",
  component: RevealFeedQuestionCard,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["actionIcon", "topCornerActionIcon", "statusLabel"],
    },
  },
  args: {
    id: 1,
    answerCount: 10,
    question: "The best way to secure your assets is to use a hardware wallet",
    revealAtAnswerCount: 20,
    revealAtDate: dayjs(new Date()).add(1, "day").toDate(),
    revealTokenAmount: 1000,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RevealFeedQuestionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
