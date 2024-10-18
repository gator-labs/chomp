import type { Meta, StoryObj } from "@storybook/react";

import { Profile } from "../app/components/Profile/Profile";

const meta = {
  title: "Profile",
  component: Profile,
  parameters: {
    layout: "centered",
  },
  args: {},
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="w-96">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
