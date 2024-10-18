import type { Meta, StoryObj } from "@storybook/react";

import { ChallengeIcon } from "../app/components/Icons/ChallengeIcon";
import { ComposeIcon } from "../app/components/Icons/ComposeIcon";
import { HomeIcon } from "../app/components/Icons/HomeIcon";
import { Navigation } from "../app/components/Navigation/Navigation";

const meta = {
  title: "Navigation",
  component: Navigation,
  parameters: {
    layout: "centered",
  },
  args: {},
  tags: ["autodocs"],
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Answer", icon: <ChallengeIcon />, href: "/answer" },
      { label: "Home", icon: <HomeIcon />, href: "/" },
      { label: "Ask", icon: <ComposeIcon />, href: "/ask" },
    ],
  },
};

export const MyProfileActive: Story = {
  args: {
    items: [
      {
        label: "Answer",
        icon: <ChallengeIcon />,
        href: "/answer",
      },
      { label: "Home", icon: <HomeIcon />, href: "/" },
      { label: "Ask", icon: <ComposeIcon />, href: "/ask" },
    ],
  },
};
