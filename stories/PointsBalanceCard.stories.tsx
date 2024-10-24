import PointBalanceCard from "@/app/components/PointBalanceCard/PointBalanceCard";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Point balance card",
  component: PointBalanceCard,
  parameters: {
    layout: "centered",
  },
  args: {
    amount: 102301849,
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="w-96">
      <Story />
    </div>
  ),
} satisfies Meta<typeof PointBalanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
