import QuestionAnswerPreviewBinary from "@/app/components/QuestionAnswerPreviewBinary/QuestionAnswerPreviewBinary";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";

const meta = {
  title: "Reveal/Question answer preview binary",
  component: QuestionAnswerPreviewBinary,
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
} satisfies Meta<typeof QuestionAnswerPreviewBinary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    question: "Humans have more than five senses",
    revealAtDate: dayjs(new Date()).add(-2, "days").toDate(),
    optionSelected: "Yes",
  },
};
