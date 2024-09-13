import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "../app/components/Button/Button";
import { ShareIcon } from "../app/components/Icons/ShareIcon";

const meta = {
  title: "Button",
  component: Button,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["children"],
    },
  },
  tags: ["autodocs"],
  args: { onClick: fn(), children: <>Button</> },
  decorators: (Story) => (
    <div className="w-52">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    size: "big",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "big",
  },
  decorators: (Story) => (
    <div className="bg-gray-800 p-2">
      <Story />
    </div>
  ),
};

export const White: Story = {
  args: {
    variant: "white",
  },
  decorators: (Story) => (
    <div className="bg-gray-800 p-2">
      <Story />
    </div>
  ),
};

export const Share: Story = {
  args: {
    variant: "secondary",
    size: "small",
    children: <ShareIcon />,
  },
  decorators: (Story) => (
    <div className="bg-gray-800 p-2">
      <Story />
    </div>
  ),
};

export const Black: Story = {
  args: {
    variant: "black",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    disabled: true,
  },
};
