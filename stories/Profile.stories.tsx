import type { Meta, StoryObj } from "@storybook/react";
import { Profile } from "../app/components/Profile/Profile";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Profile",
  component: Profile,
  parameters: {
    layout: "centered",
  },
  args: {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    joinDate: new Date(2023, 3, 23),
    avatarSrc: AvatarSample.src,
  },
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
