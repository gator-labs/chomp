import PrimarySliderV2 from "@chomp/app/components/PrimarySlider/PrimarySliderV2";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Primary slider v2",
  component: PrimarySliderV2,
  parameters: {
    layout: "centered",
  },
  args: {},
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="bg-black w-80 p-8">
      <Story />
    </div>
  ),
} satisfies Meta<typeof PrimarySliderV2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 10,
  },
};
