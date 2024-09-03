import Stepper from "@/app/components/Stepper/Stepper";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Stepper",
  component: Stepper,
  parameters: {
    layout: "centered",
  },
  args: {
    activeStep: 3,
    numberOfSteps: 5,
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="bg-grey-850 w-80 p-8">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
