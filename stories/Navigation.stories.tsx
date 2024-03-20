import type { Meta, StoryObj } from "@storybook/react";
import { Navigation } from "../app/components/Navigation/Navigation";
import { ChallengeIcon } from "../app/components/Icons/ChallengeIcon";
import { HomeIcon } from "../app/components/Icons/HomeIcon";
import { ComposeIcon } from "../app/components/Icons/ComposeIcon";

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
      {
        label: "Answer",
        icon: <ChallengeIcon />,
        href: "/answer",
        isActive: false,
      },
      { label: "Home", icon: <HomeIcon />, href: "/", isActive: false },
      { label: "Ask", icon: <ComposeIcon />, href: "/ask", isActive: false },
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
        isActive: true,
      },
      { label: "Home", icon: <HomeIcon />, href: "/", isActive: false },
      { label: "Ask", icon: <ComposeIcon />, href: "/ask", isActive: false },
    ],
  },
};
