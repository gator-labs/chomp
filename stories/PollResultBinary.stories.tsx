import type { Meta, StoryObj } from "@storybook/react";

import PollResultBinary from "@/app/components/PollResultBinary/PollResultBinary";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Reveal/Poll result binary",
  component: PollResultBinary,
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
} satisfies Meta<typeof PollResultBinary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Binary: Story = {
  args: {
    optionSelected: "Yes",
    percentageSelected: 73,
    avatarSrc: AvatarSample.src,
    leftOption: { option: "Yes", percentage: 73 },
    rightOption: { option: "No", percentage: 27 },
  },
};
