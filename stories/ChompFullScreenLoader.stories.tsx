import ChompFullScreenLoader from "@/app/components/ChompFullScreenLoader/ChompFullScreenLoader";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Chomp full screen loader",
  component: ChompFullScreenLoader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {},
  decorators: (Story) => (
    <div className="w-52 h-[512px]">
      <Story />
    </div>
  ),
} satisfies Meta<typeof ChompFullScreenLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLoading: true,
    loadingMessage: "Burning bonk...",
  },
};
