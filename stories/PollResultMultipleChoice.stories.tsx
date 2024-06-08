import type { Meta, StoryObj } from "@storybook/react";

import PollResultMultipleChoice from "@chomp/app/components/PollResultMultipleChoice/PollResultMultipleChoice";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Reveal/Poll result multiple choice",
  component: PollResultMultipleChoice,
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
} satisfies Meta<typeof PollResultMultipleChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiChoice: Story = {
  args: {
    optionSelected: "A",
    percentageSelected: 8,
    avatarSrc: AvatarSample.src,
    isCorrect: true,
    options: [
      { label: "A", option: "New York", percentage: 8 },
      { label: "B", option: "Berlin", percentage: 11 },
      { label: "C", option: "Dubai", percentage: 74 },
      { label: "D", option: "Bangkok", percentage: 7 },
    ],
  },
};
