import QuestionAnswerPreview from "@/app/components/QuestionAnswerPreview/QuestionAnswerPreview";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";

const meta = {
  title: "Reveal/Question answer preview",
  component: QuestionAnswerPreview,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {},
  decorators: (Story) => (
    <div className="w-80">
      <Story />
    </div>
  ),
} satisfies Meta<typeof QuestionAnswerPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    question: "Which city did Chomp’s alpha launch take place?",
    revealAtDate: dayjs(new Date()).add(-2, "days").toDate(),
  },
};
