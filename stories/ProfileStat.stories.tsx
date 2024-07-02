import { QuestIcon } from "@/app/components/Icons/QuestIcon";
import { ProfileStat } from "@/app/components/ProfileStat/ProfileStat";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Profile stat",
  component: ProfileStat,
  parameters: {
    layout: "centered",
  },
  args: {},
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="bg-black w-96">
      <Story />
    </div>
  ),
} satisfies Meta<typeof ProfileStat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <QuestIcon />,
    label: "Cards Chomped",
    value: "34",
  },
};
