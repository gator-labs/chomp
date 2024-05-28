import { HomeFeedEmptyQuestionCard } from "@/app/components/HomeFeedEmptyQuestionCard/HomeFeedEmptyQuestionCard";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Cards/Home Feed Empty Question card",
  component: HomeFeedEmptyQuestionCard,
  parameters: {
    layout: "centered",
  },
  args: {},
  tags: ["autodocs"],
} satisfies Meta<typeof HomeFeedEmptyQuestionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
