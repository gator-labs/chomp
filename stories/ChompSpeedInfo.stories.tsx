import { InfoIcon } from "@/app/components/Icons/InfoIcon";
import ChompSpeedInfo from "@/app/components/InfoBoxes/Home/ChompSpeedInfo";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "InfoBox/Chomp speed info",
  component: ChompSpeedInfo,
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
} satisfies Meta<typeof ChompSpeedInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
