import type { Meta, StoryObj } from "@storybook/react";
import { HomeIndicator } from "../app/components/HomeIndicator/HomeIndicator";

const meta = {
  title: "HomeIndicator",
  component: HomeIndicator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { href: "/" },
  decorators: (Story) => (
    <div className="w-52">
      <Story />
    </div>
  ),
} satisfies Meta<typeof HomeIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  args: {
    theme: "dark",
  },
};

export const Light: Story = {
  args: {
    theme: "light",
  },
};
