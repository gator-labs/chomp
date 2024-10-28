import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { Tag } from "../app/components/Tag/Tag";

const meta = {
  title: "Tag",
  component: Tag,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onSelected: fn(),
  },
  argTypes: {
    isSelected: { type: "boolean" },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tag: "DePin",
    isSelected: false,
  },
};

export const Selected: Story = {
  args: {
    tag: "Defi",
    isSelected: true,
  },
};
