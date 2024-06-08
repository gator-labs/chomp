import BestAnswerMultipleChoice from "@chomp/app/components/BestAnswerMultipleChoice/BestAnswerMultipleChoice";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Reveal/Best answer multiple choice",
  component: BestAnswerMultipleChoice,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["icon"],
    },
  },
  tags: ["autodocs"],
  args: {},
  decorators: (Story) => (
    <div className="w-80">
      <Story />
    </div>
  ),
} satisfies Meta<typeof BestAnswerMultipleChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    optionSelected: "C",
    bestOption: "C",
    optionLabel: "Dubai",
  },
};
