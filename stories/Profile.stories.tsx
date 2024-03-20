import type { Meta, StoryObj } from "@storybook/react";
import { Profile } from "../app/components/Profile/Profile";
import AvatarSample from "./assets/avatar_sample.png";
import { fn } from "@storybook/test";

const meta = {
  title: "Profile",
  component: Profile,
  parameters: {
    layout: "centered",
  },
  args: {
    fullName: "Alex Smith",
    handle: "Curious.mind88",
    joinDate: new Date(2023, 3, 23),
    avatarSrc: AvatarSample.src,
    onSettingsClick: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
