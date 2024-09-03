import { TransactionRow } from "@/app/components/TransactionsTable/TransactionRow/TransactionRow";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";

const meta = {
  title: "Transaction table/Row",
  component: TransactionRow,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    amount: 100000,
    date: dayjs().subtract(12, "hours").toDate(),
    amountLabel: "BONK",
    dollarAmount: 2.3,
    transactionType: "RevealAnswer",
  },
  decorators: (Story) => (
    <div className="w-96 bg-grey-700 p-4">
      <Story />
    </div>
  ),
} satisfies Meta<typeof TransactionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
