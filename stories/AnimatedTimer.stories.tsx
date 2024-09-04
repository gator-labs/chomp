import AnimatedTimer from "@/app/components/AnimatedTimer/AnimatedTimer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Animated timer",
  component: AnimatedTimer,
  parameters: {
    layout: "centered",
  },
  args: {
    duration: 5000,
    id: "1",
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="bg-gray-850 p-2">
      <Story />
    </div>
  ),
} satisfies Meta<typeof AnimatedTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
