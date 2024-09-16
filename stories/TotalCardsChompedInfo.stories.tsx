import { InfoIcon } from "@/app/components/Icons/InfoIcon";
import TotalCardChompedInfo from "@/app/components/InfoBoxes/Home/TotalCardsChompedInfo";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "InfoBox/Total cards chomped info",
  component: TotalCardChompedInfo,
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
    <div className="bg-gray-800">
      <Story />
    </div>
  ),
} satisfies Meta<typeof TotalCardChompedInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
