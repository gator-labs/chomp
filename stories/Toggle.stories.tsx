import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "../app/components/Toggle/Toggle";
import { fn } from "@storybook/test";

const meta = {
  title: "Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onToggle: fn(),
  },
  argTypes: {
    isOn: { type: "boolean" },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {
  args: {
    isOn: true,
  },
};

export const Off: Story = {
  args: {
    isOn: false,
  },
};
