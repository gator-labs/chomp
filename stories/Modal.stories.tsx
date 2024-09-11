import { Button } from "@/app/components/Button/Button";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Modal } from "../app/components/Modal/Modal";

const meta = {
  title: "Modal",
  component: Modal,
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
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="text-sm text-white ">
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
    title: "Title",
  },
};
