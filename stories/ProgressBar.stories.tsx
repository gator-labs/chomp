import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "../app/components/ProgressBar/ProgressBar";
import { fn } from "@storybook/test";

const meta = {
  title: "Progress/Bar",
  component: ProgressBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    percentage: { type: "number" },
    onChange: fn(),
  },
  decorators: (Story) => (
    <div className="w-52">
      <Story />
    </div>
  ),
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    percentage: 50,
  },
};
