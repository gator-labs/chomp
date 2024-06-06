import QuestionAnswerPreviewMultipleChoice from "@/app/components/QuestionAnswerPreviewMultipleChoice/QuestionAnswerPreviewMultipleChoice";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";

const meta = {
  title: "Reveal/Question answer preview multiple choice",
  component: QuestionAnswerPreviewMultipleChoice,
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
} satisfies Meta<typeof QuestionAnswerPreviewMultipleChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [
      { id: 1, option: "New york" },
      { id: 2, option: "Berlin" },
      { id: 3, option: "Dubai" },
      { id: 4, option: "Bangkok" },
    ],
    optionSelectedId: 3,
    question: "Which city did Chomp’s alpha launch take place?",
    revealAtDate: dayjs(new Date()).add(-2, "days").toDate(),
  },
};
