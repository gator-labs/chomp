import type { Meta, StoryObj } from "@storybook/react";
import { Ranking } from "../app/components/Ranking/Ranking";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Ranking",
  component: Ranking,
  parameters: {
    layout: "centered",
  },
  args: {
    avatarSrc: AvatarSample.src,
    level: "43",
    progress: 92,
    rank: "1",
    userName: "user.name",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Ranking>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Highlighted: Story = {
  args: {
    isHighlighted: true,
  },
};
