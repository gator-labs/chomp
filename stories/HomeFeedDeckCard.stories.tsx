import { HomeFeedDeckCard } from "@chomp/app/components/HomeFeedDeckCard/HomeFeedDeckCard";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import dayjs from "dayjs";

const meta = {
  title: "Cards/Home Feed Deck card",
  component: HomeFeedDeckCard,
  parameters: {
    layout: "centered",
  },
  args: {
    answerCount: 10,
    deck: "How much do you know about chomp team?",
    revealAtAnswerCount: 20,
    revealAtDate: dayjs(new Date()).add(1, "day").toDate(),
    status: "new",
    onClick: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HomeFeedDeckCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
