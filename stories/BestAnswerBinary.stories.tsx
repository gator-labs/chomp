import BestAnswerBinary from "@/app/components/BestAnswerBinary/BestAnswerBinary";
import LikeIcon from "@/app/components/Icons/LikeIcon";
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

export const Default: Story = {
  args: {
    optionSelected: "Yes",
    bestOption: "Yes",
    icon: <LikeIcon />,
  },
};
