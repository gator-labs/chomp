import { QuestionDeck } from "../app/components/QuestionDeck/QuestionDeck";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";

const meta = {
  title: "Cards/Question Deck",
  component: QuestionDeck,
  parameters: {
    layout: "centered",
  },
  args: {
    text: "Test your knowledge on leverage trading.",
    revealedAt: dayjs().add(2, "days").toDate(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof QuestionDeck>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "new",
  },
};

export const Chomped: Story = {
  args: {
    status: "chomped",
  },
};

export const Continue: Story = {
  args: {
    status: "continue",
  },
};
