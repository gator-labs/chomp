import type { Meta, StoryObj } from "@storybook/react";
import { MultipleChoiceAnsweredContent } from "../app/components/MultipleChoiceAnsweredContent/MultipleChoiceAnsweredContent";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Multiple Choice answered content",
  component: MultipleChoiceAnsweredContent,
  parameters: {
    layout: "centered",
  },
  args: {
    questionOptions: [
      {
        id: 1,
        option: "Option 1",
        isCorrect: false,
        questionAnswers: [
          {
            percentage: null,
            selected: false,
            percentageResult: 20,
          },
        ],
      },
      {
        id: 2,
        option: "Option 2",
        isCorrect: false,
        questionAnswers: [
          {
            percentage: null,
            selected: true,
            percentageResult: 40,
          },
        ],
      },
      {
        id: 3,
        option: "Option 3",
        isCorrect: false,
        questionAnswers: [
          {
            percentage: 30,
            selected: false,
            percentageResult: 10,
          },
        ],
      },
      {
        id: 4,
        isCorrect: false,
        option: "Option 4",
        questionAnswers: [
          {
            percentage: null,
            selected: false,
            percentageResult: 30,
          },
        ],
      },
    ],
    avatarSrc: AvatarSample.src,
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="w-80 p-4 bg-black">
      <Story />
    </div>
  ),
} satisfies Meta<typeof MultipleChoiceAnsweredContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
