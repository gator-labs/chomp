import { DashboardUserStats } from "@chomp/app/components/DashboardUserStats/DashboardUserStats";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Dashboard User Stats",
  component: DashboardUserStats,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    averageTimeToAnswer: "0:21",
    cardsChomped: "34",
    daysStreak: "7",
    totalPointsEarned: "103",
  },
} satisfies Meta<typeof DashboardUserStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
