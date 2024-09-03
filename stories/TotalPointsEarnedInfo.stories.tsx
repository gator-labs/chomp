import { InfoIcon } from "@/app/components/Icons/InfoIcon";
import TotalPointsEarnedInfo from "@/app/components/InfoBoxes/Home/TotalPointsEarnedInfo";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "InfoBox/Total points earned info",
  component: TotalPointsEarnedInfo,
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
    <div className="bg-grey-850">
      <Story />
    </div>
  ),
} satisfies Meta<typeof TotalPointsEarnedInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
