import type { Meta, StoryObj } from "@storybook/react";
import { SwitchNavigation } from "../app/components/SwitchNavigation/SwitchNavigation";

const meta = {
  title: "Switch Navigation",
  component: SwitchNavigation,
  parameters: {
    layout: "centered",
  },
  args: {},
  tags: ["autodocs"],
} satisfies Meta<typeof SwitchNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    navigationItems: [
      { href: "#", label: "Dashboard", isActive: false },
      { href: "#", label: "Leaderboard", isActive: false },
      { href: "#", label: "History", isActive: false },
    ],
  },
};

export const MyProfileActive: Story = {
  args: {
    navigationItems: [
      { href: "#", label: "Dashboard", isActive: true },
      { href: "#", label: "Leaderboard", isActive: false },
      { href: "#", label: "History", isActive: false },
    ],
  },
};
