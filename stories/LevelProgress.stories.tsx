import type { Meta, StoryObj } from "@storybook/react";
import { LevelProgress } from "../app/components/LevelProgress/LevelProgress";

const meta = {
  title: "Progress/Level",
  component: LevelProgress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    progress: { type: "number" },
  },
  decorators: (Story) => (
    <div className="w-52 bg-black p-4">
      <Story />
    </div>
  ),
} satisfies Meta<typeof LevelProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    level: "43",
    progress: 50,
  },
};
