import { BestAnswer } from "@/app/components/BestAnswer/BestAnswer";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Reveal/Best answer",
  component: BestAnswer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {},
  decorators: (Story) => (
    <div className="w-80">
      <Story />
    </div>
  ),
} satisfies Meta<typeof BestAnswer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    optionSelected: "Yes",
  },
};
