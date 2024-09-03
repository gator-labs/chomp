import TopInfoBox from "@/app/components/InfoBoxes/RevealPage/TopInfoBox";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "InfoBox/Top info box",
  component: TopInfoBox,
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
} satisfies Meta<typeof TopInfoBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
