import BestAnswerBinary from "@/app/components/BestAnswerBinary/BestAnswerBinary";
import LikeIcon from "@/app/components/Icons/LikeIcon";
import UnlikeIcon from "@/app/components/Icons/UnlikeIcon";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Reveal/Best answer binary",
  component: BestAnswerBinary,
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
} satisfies Meta<typeof BestAnswerBinary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Correct: Story = {
  args: {
    optionSelected: "Yes",
    bestOption: "Yes"
  },
};

export const Incorrect: Story = {
  args: {
    optionSelected: "Yes",
    bestOption: "No"
  },
};

export const NonIcon: Story = {
  args: {
    optionSelected: "White",
    bestOption: "White",
  },
};
