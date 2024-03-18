import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { SearchInput } from "../app/components/SearchInput/SearchInput";

const meta = {
  title: "Inputs/Search",
  component: SearchInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onChange: fn(), value: "Search Questions" },
  decorators: (Story) => (
    <div className="w-[334px]">
      <Story />
    </div>
  ),
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
