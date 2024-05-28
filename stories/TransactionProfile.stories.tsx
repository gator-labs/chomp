import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { TransactionProfile } from "../app/components/TransactionProfile/TransactionProfile";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Transaction profile",
  component: TransactionProfile,
  parameters: {
    layout: "centered",
  },
  args: {
    dollarAmount: 218.45,
    avatarSrc: AvatarSample.src,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TransactionProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Points: Story = {
  args: {
    pointAmount: 108184184,
  },
};

export const Bonk: Story = {
  args: {
    bonkAmount: 108184184,
  },
};

export const WithClose: Story = {
  args: {
    bonkAmount: 108184184,
    onClose: fn(),
  },
};
