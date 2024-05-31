import type { Meta, StoryObj } from "@storybook/react";
import { NoQuestionsCard } from "../app/components/NoQuestionsCard/NoQuestionsCard";

const meta = {
  title: "Cards/No Questions Card",
  component: NoQuestionsCard,
  parameters: {
    layout: "centered",
  },
  args: {
    browseHomeUrl: "/application",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof NoQuestionsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isAnswerPage: false,
    variant: "regular-deck",
  },
};

export const IsAnswerPage: Story = {
  args: {
    isAnswerPage: true,
    variant: "answer-page",
  },
};
