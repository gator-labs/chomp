import RewardInfoBox from "@/app/components/InfoBoxes/RevealPage/RewardInfoBox";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "InfoBox/Reward info box",
  component: RewardInfoBox,
  parameters: {
    layout: "centered",
  },
  args: {},
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="bg-grey-850">
      <Story />
    </div>
  ),
} satisfies Meta<typeof RewardInfoBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
