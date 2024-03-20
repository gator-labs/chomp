import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "../app/components/Navbar/Navbar";
import AvatarSample from "./assets/avatar_sample.png";
import { HalfArrowLeftIcon } from "../app/components/Icons/HalfArrowLeftIcon";

const meta = {
  title: "Navbar",
  component: Navbar,
  parameters: {
    layout: "centered",
  },
  args: {
    avatarLink: "/",
    walletLink: "/",
    avatarSrc: AvatarSample.src,
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="w-96">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const HasChildren: Story = {
  args: {
    children: (
      <div className="flex items-center text-white text-sm">
        <HalfArrowLeftIcon />{" "}
        <span>Test your knowledge on leverage trading</span>
      </div>
    ),
  },
};
