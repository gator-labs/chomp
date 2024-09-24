import { AnswerHeader } from "@/app/components/AnswerHeader/AnswerHeader";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Answer header",
  component: AnswerHeader,
  parameters: {
    layout: "centered",
  },
  args: {
    questionTags: [
      {
        id: 1,
        createdAt: new Date(),
        questionId: 1,
        tagId: 1,
        updatedAt: new Date(),
        tag: {
          id: 1,
          tag: "Tag 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="w-80 bg-gray-800">
      <Story />
    </div>
  ),
} satisfies Meta<typeof AnswerHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
