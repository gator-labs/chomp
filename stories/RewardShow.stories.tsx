import RewardShow from "@chomp/app/components/RewardShow/RewardShow";
import ConfettiProvider from "@chomp/app/providers/ConfettiProvider";
import { ToastProvider } from "@chomp/app/providers/ToastProvider";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Reveal/Reward show",
  component: RewardShow,
  parameters: {
    layout: "centered",
  },
  args: {
    rewardAmount: 10000,
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <ToastProvider>
      <ConfettiProvider>
        <Story />
      </ConfettiProvider>
    </ToastProvider>
  ),
} satisfies Meta<typeof RewardShow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
