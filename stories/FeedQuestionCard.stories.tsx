import { FeedQuestionCard } from "@chomp/app/components/FeedQuestionCard/FeedQuestionCard";
import { CloseIcon } from "@chomp/app/components/Icons/CloseIcon";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import dayjs from "dayjs";

const meta = {
  title: "Cards/Feed Question card",
  component: FeedQuestionCard,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["actionIcon", "topCornerActionIcon", "statusLabel"],
    },
  },
  args: {
    answerCount: 10,
    question: "The best way to secure your assets is to use a hardware wallet",
    revealAtAnswerCount: 20,
    revealAtDate: dayjs(new Date()).add(1, "day").toDate(),
    onTopCornerAction: fn(),
    topCornerActionIcon: <CloseIcon />,
    statusLabel: (
      <button
        onClick={fn()}
        className="text-xs leading-6 text-white font-bold cursor-pointer"
      >
        View
      </button>
    ),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FeedQuestionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
