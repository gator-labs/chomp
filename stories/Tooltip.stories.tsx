import Tooltip from "@chomp/app/components/Tooltip/Tooltip";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["children"],
    },
  },
  tags: ["autodocs"],
  args: {},
  decorators: (Story) => (
    <div className="p-12">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div>Example</div>,
    infoText: "Text about example",
  },
};
