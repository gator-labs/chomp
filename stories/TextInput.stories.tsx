import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { TextInput } from "../app/components/TextInput/TextInput";

const meta = {
  title: "Inputs/Text",
  component: TextInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onChange: fn(), value: "Required input here" },
  decorators: (Story) => (
    <div className="w-52">
      <Story />
    </div>
  ),
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};
