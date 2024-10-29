import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";

import { Navbar } from "../app/components/Navbar/Navbar";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Navbar",
  component: Navbar,
  parameters: {
    layout: "centered",
  },
  args: {
    avatarSrc: AvatarSample.src,
    address: "BqcQDyZLW1mL14MgfwMsLkifNScDUTmks55R8x1uAwox",
    bonkBalance: 9999,
    solBalance: 10,
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
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
