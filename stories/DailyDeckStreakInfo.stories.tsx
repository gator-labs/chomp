import { InfoIcon } from "@/app/components/Icons/InfoIcon";
import DailyDeckStreakInfo from "@/app/components/InfoBoxes/Home/DailyDeckStreakInfo";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "InfoBox/Daily deck streak info",
  component: DailyDeckStreakInfo,
  parameters: {
    layout: "centered",
    controls: {
      exclude: ["children"],
    },
  },
  args: {
    children: <InfoIcon height={24} width={24} fill="#fff" />,
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="bg-gray-850">
      <Story />
    </div>
  ),
} satisfies Meta<typeof DailyDeckStreakInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
