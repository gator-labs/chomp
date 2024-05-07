import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { TrueFalseScale } from "../app/components/TrueFalseScale/TrueFalseScale";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "True False Scale",
  component: TrueFalseScale,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    ratioLeft: 80,
    labelLeft: "True",
    labelRight: "False",
    avatarSrc: AvatarSample.src,
    handleRatioChange: fn(),
  },
  argTypes: {
    ratioLeft: { type: "number" },
    valueSelected: { type: "number" },
  },
  decorators: (Story) => (
    <div className="w-52 bg-black p-4">
      <Story />
    </div>
  ),
} satisfies Meta<typeof TrueFalseScale>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Selected: Story = {
  args: {
    valueSelected: 80,
  },
};
