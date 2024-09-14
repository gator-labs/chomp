import { TabNavigation } from "@/app/components/TabNavigation/TabNavigation";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Tab navigation",
  component: TabNavigation,
  parameters: {
    layout: "centered",
  },
  args: {},
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="bg-gray-800 w-80 p-8">
      <Story />
    </div>
  ),
} satisfies Meta<typeof TabNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isAdmin: false,
  },
};

export const Admin: Story = {
  args: {
    isAdmin: true,
  },
};
