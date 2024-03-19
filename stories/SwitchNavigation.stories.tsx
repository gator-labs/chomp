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
      { href: "#", label: "My Profile", isActive: false },
      { href: "#", label: "History/Rewards", isActive: false },
    ],
  },
};

export const MyProfileActive: Story = {
  args: {
    navigationItems: [
      { href: "#", label: "My Profile", isActive: true },
      { href: "#", label: "History/Rewards", isActive: false },
    ],
  },
};
