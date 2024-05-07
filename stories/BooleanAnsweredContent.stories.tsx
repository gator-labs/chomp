import type { Meta, StoryObj } from "@storybook/react";
import { BooleanAnsweredContent } from "../app/components/BooleanAnsweredContent/BooleanAnsweredContent";
import AvatarSample from "./assets/avatar_sample.png";

const meta = {
  title: "Boolean answered content",
  component: BooleanAnsweredContent,
  parameters: {
    layout: "centered",
  },
  args: {
    avatarSrc: AvatarSample.src,
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="w-80 p-4 bg-black">
      <Story />
    </div>
  ),
} satisfies Meta<typeof BooleanAnsweredContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TrueFalse: Story = {
  args: {
    questionOptions: [
      {
        id: 1,
        option: "True",
        isCorrect: false,
        isLeft: true,
        questionAnswers: [
          {
            percentage: 40,
            selected: false,
            percentageResult: 20,
          },
        ],
      },
      {
        id: 2,
        option: "False",
        isCorrect: false,
        isLeft: false,
        questionAnswers: [
          {
            percentage: null,
            selected: true,
            percentageResult: 40,
          },
        ],
      },
    ],
  },
};

export const YesNo: Story = {
  args: {
    questionOptions: [
      {
        id: 1,
        option: "Yes",
        isCorrect: false,
        isLeft: true,
        questionAnswers: [
          {
            percentage: 40,
            selected: false,
            percentageResult: 20,
          },
        ],
      },
      {
        id: 2,
        option: "No",
        isCorrect: false,
        isLeft: false,
        questionAnswers: [
          {
            percentage: null,
            selected: true,
            percentageResult: 40,
          },
        ],
      },
    ],
  },
};
