import type { Meta, StoryObj } from "@storybook/react";
import { TransactionProfile } from "../app/components/TransactionProfile/TransactionProfile";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Transaction profile",
  component: TransactionProfile,
  parameters: {
    layout: "centered",
  },
  args: {
    bonkAmount: 108184184,
    dollarAmount: 218.45,
    avatarSrc: AvatarSample.src,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TransactionProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
