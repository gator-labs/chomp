import Sheet from "@/app/components/Sheet/Sheet";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

const meta = {
  title: "Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["children"],
    },
  },
  args: {
    setIsOpen: fn(),
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="bg-grey-850">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div className="text-grey-0 text-center p-4">Sample</div>,
    isOpen: true,
  },
};
