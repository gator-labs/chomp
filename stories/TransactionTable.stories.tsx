import { TransactionsTable } from "@/app/components/TransactionsTable/TransactionsTable";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";

const meta = {
  title: "Transaction table/Table",
  component: TransactionsTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
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
  decorators: (Story) => (
    <div className="w-96 bg-gray-600 p-4">
      <Story />
    </div>
  ),
} satisfies Meta<typeof TransactionsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
