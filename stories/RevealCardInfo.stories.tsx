import { RevealCardInfo } from "@/app/components/RevealCardInfo/RevealCardInfo";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";

const meta = {
  title: "Cards/Reveal card info",
  component: RevealCardInfo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="w-80 p-4 bg-gray-800">
      <Story />
    </div>
  ),
} satisfies Meta<typeof RevealCardInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    answerCount: 10,
    revealAtAnswerCount: 20,
    revealAtDate: dayjs(new Date()).add(1, "day").toDate(),
  },
};

export const DateOnly: Story = {
  args: {
    revealAtDate: dayjs(new Date()).add(1, "day").toDate(),
  },
};

export const CountOnly: Story = {
  args: {
    answerCount: 10,
    revealAtAnswerCount: 20,
  },
};
