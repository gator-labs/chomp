import { HomeFeedDeckCard } from "@/app/components/HomeFeedDeckCard/HomeFeedDeckCard";
import type { Meta, StoryObj } from "@storybook/react";
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
    deckId: 1,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HomeFeedDeckCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
