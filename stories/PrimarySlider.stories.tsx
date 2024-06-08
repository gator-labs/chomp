import PrimarySlider from "@chomp/app/components/PrimarySlider/PrimarySlider";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Primary slider",
  component: PrimarySlider,
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
} satisfies Meta<typeof PrimarySlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 10,
  },
};
