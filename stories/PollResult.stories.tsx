import MultipleChoiceResult from "@/app/components/MultipleChoiceResult/MultipleChoiceResult";
import PollResult from "@/app/components/PollResult/PollResult";
import type { Meta, StoryObj } from "@storybook/react";

import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Reveal/Poll Result",
  component: PollResult,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["resultProgressComponent"],
    },
  },
  tags: ["autodocs"],
  args: {},
  decorators: (Story) => (
    <div className="w-80">
      <Story />
    </div>
  ),
} satisfies Meta<typeof PollResult>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiChoiceCorrect: Story = {
  args: {
    optionSelected: "A",
    percentageSelected: 8,
    resultProgressComponent: <MultipleChoiceResult />,
    avatarSrc: AvatarSample.src,
    isCorrect: true,
  },
};

export const MultiChoiceIncorrect: Story = {
  args: {
    optionSelected: "A",
    percentageSelected: 8,
    resultProgressComponent: <MultipleChoiceResult />,
    avatarSrc: AvatarSample.src,
    isCorrect: false,
  },
};

export const NoAnswer: Story = {
  args: {},
};
