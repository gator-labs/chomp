import type { Meta, StoryObj } from "@storybook/react";
import { DailyDeckTitle } from "../app/components/DailyDeckTitle/DailyDeckTitle";

const meta = {
  title: "Cards/Daily Deck title",
  component: DailyDeckTitle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    date: new Date(),
  },
} satisfies Meta<typeof DailyDeckTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
