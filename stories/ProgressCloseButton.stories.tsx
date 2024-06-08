import ProgressCloseButton from "@chomp/app/components/ProgressCloseButton/ProgressCloseButton";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

const meta = {
  title: "Progress close button",
  component: ProgressCloseButton,
  parameters: {
    layout: "centered",
  },
  args: {
    onClick: fn(),
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="bg-black p-4">
      <Story />
    </div>
  ),
} satisfies Meta<typeof ProgressCloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    progressDuration: 1000,
  },
};
