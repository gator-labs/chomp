import MultipleChoiceResult from "@chomp/app/components/MultipleChoiceResult/MultipleChoiceResult";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Reveal/Multiple choice result",
  component: MultipleChoiceResult,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["text"],
    },
  },
  tags: ["autodocs"],
  args: {
    text: <div>Dubai</div>,
  },
  decorators: (Story) => (
    <div className="w-80">
      <Story />
    </div>
  ),
} satisfies Meta<typeof MultipleChoiceResult>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    percentage: 74,
  },
};
