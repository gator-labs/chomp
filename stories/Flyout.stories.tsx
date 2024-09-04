import { Button } from "@/app/components/Button/Button";
import { Flyout } from "@/app/components/Flyout/Flyout";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

const meta = {
  title: "Flyout",
  component: Flyout,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["children"],
    },
  },
  tags: ["autodocs"],
  args: {
    isOpen: true,
    onClose: fn(),
  },
  decorators: (Story) => (
    <div className="w-52 h-[512px]">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Flyout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="text-sm text-white font-sora p-4">
        <div className="mb-4">
          This is a generic modal with a close button on the top right
        </div>
        <div>
          <Button variant="white">Button</Button>
        </div>
        <div className="mt-2">
          <Button variant="black">Button</Button>
        </div>
      </div>
    ),
  },
};
