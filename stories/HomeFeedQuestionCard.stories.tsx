import { HomeFeedQuestionCard } from "@/app/components/HomeFeedQuestionCard/HomeFeedQuestionCard";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import dayjs from "dayjs";

const meta = {
  title: "Cards/Home Feed Question card",
  component: HomeFeedQuestionCard,
  parameters: {
    layout: "centered",
  },
  args: {
    answerCount: 10,
    question: "The best way to secure your assets is to use a hardware wallet",
    revealAtAnswerCount: 20,
    revealAtDate: dayjs(new Date()).add(1, "day").toDate(),
    onClear: fn(),
    onView: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HomeFeedQuestionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
