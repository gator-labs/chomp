import { QuestionType } from "@prisma/client";
import type { Meta, StoryObj } from "@storybook/react";
import { Deck } from "../app/components/Deck/Deck";
import { ONE_MINUTE_IN_MILLISECONDS } from "../app/utils/dateUtils";

const questionBase = {
  type: QuestionType.BinaryQuestion,
  durationMiliseconds: ONE_MINUTE_IN_MILLISECONDS / 4,
  questionOptions: [
    {
      id: 1,
      option: "False",
      isLeft: false,
    },
    { id: 2, option: "True", isLeft: true },
  ],
  questionTags: [
    { id: 1, tag: "Defi" },
    { id: 2, tag: "Not defi" },
  ],
};

const meta = {
  title: "Cards/Deck",
  component: Deck,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  args: {
    deckId: 1,
    questions: [
      {
        ...questionBase,
        id: 1,
        question:
          "The best way to secure your assets is to use a hardware wallet.",
        questionTags: [],
      },
      {
        ...questionBase,
        type: QuestionType.MultiChoice,
        questionOptions: [
          { id: 1, option: "Answer", isLeft: false },
          { id: 2, option: "Answer", isLeft: false },
          { id: 3, option: "Answer", isLeft: false },
          { id: 4, option: "Answer", isLeft: false },
        ],
        id: 2,
        question:
          "The best way to secure your assets is to use a software wallet.",
        questionTags: [],
      },
      {
        ...questionBase,
        id: 3,
        question:
          "The best way to secure your assets is to use a wooden wallet.",
        questionTags: [],
      },
    ],
    deckVariant: "daily-deck",
  },
  decorators: (Story) => (
    <div className="bg-gray-800 p-10">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Deck>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
