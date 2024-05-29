import { QuickViewProfile } from "@/app/components/QuickViewProfile/QuickViewProfile";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import dayjs from "dayjs";

import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "QuickViewProfile",
  component: QuickViewProfile,
  parameters: {
    layout: "centered",
  },
  args: {
    address: "BqcQDyZLW1mL14MgfwMsLkifNScDUTmks55R8x1uAwox",
    bonkAmount: 108184184,
    dollarAmount: 218.45,
    onClose: fn(),
    avatarSrc: AvatarSample.src,
    isOpen: true,
    transactions: [
      {
        amount: 100000,
        date: dayjs().subtract(12, "hours").toDate(),
        amountLabel: "BONK",
        dollarAmount: 2.3,
        transactionType: "RevealAnswer",
      },
      {
        amount: 100000,
        date: dayjs().subtract(12, "hours").toDate(),
        amountLabel: "BONK",
        dollarAmount: 2.3,
        transactionType: "RevealAnswer",
      },
      {
        amount: 100000,
        date: dayjs().subtract(12, "hours").toDate(),
        amountLabel: "BONK",
        dollarAmount: 2.3,
        transactionType: "RevealAnswer",
      },
      {
        amount: 100000,
        date: dayjs().subtract(12, "hours").toDate(),
        amountLabel: "BONK",
        dollarAmount: 2.3,
        transactionType: "RevealAnswer",
      },
      {
        amount: 100000,
        date: dayjs().subtract(12, "hours").toDate(),
        amountLabel: "BONK",
        dollarAmount: 2.3,
        transactionType: "RevealAnswer",
      },
      {
        amount: 100000,
        date: dayjs().subtract(12, "hours").toDate(),
        amountLabel: "BONK",
        dollarAmount: 2.3,
        transactionType: "RevealAnswer",
      },
      {
        amount: 100000,
        date: dayjs().subtract(12, "hours").toDate(),
        amountLabel: "BONK",
        dollarAmount: 2.3,
        transactionType: "RevealAnswer",
      },
      {
        amount: 100000,
        date: dayjs().subtract(12, "hours").toDate(),
        amountLabel: "BONK",
        dollarAmount: 2.3,
        transactionType: "RevealAnswer",
      },
      {
        amount: 100000,
        date: dayjs().subtract(12, "hours").toDate(),
        amountLabel: "BONK",
        dollarAmount: 2.3,
        transactionType: "RevealAnswer",
      },
    ],
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="w-96">
      <DynamicContextProvider
        settings={{
          environmentId: "PLACEHOLDER",
        }}
      >
        <Story />
      </DynamicContextProvider>
    </div>
  ),
} satisfies Meta<typeof QuickViewProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
