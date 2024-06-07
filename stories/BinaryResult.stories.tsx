import BinaryResult from "@/app/components/BinaryResult/BinaryResult";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Reveal/Binary result",
  component: BinaryResult,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["text"],
    },
  },
  tags: ["autodocs"],
  args: {},
  decorators: (Story) => (
    <div className="w-80">
      <Story />
    </div>
  ),
} satisfies Meta<typeof BinaryResult>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    optionSelected: "Yes",
    percentage: 74,
  },
};
