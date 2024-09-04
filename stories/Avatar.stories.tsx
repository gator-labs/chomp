import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../app/components/Avatar/Avatar";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  args: {
    src: AvatarSample.src,
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="bg-gray-850 w-20 h-20 flex items-center justify-center">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExtraSmall: Story = {
  args: {
    size: "extrasmall",
  },
};

export const Small: Story = {
  args: {
    size: "small",
  },
};

export const Medium: Story = {
  args: {
    size: "medium",
  },
};

export const Large: Story = {
  args: {
    size: "large",
  },
};
