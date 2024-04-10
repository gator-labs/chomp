import type { Meta, StoryObj } from "@storybook/react";
import { Deck } from "../app/components/Deck/Deck";
import { ONE_MINUTE_IN_MILISECONDS } from "../app/utils/dateUtils";
import { QuestionType } from "@prisma/client";

const questionBase = {
  type: QuestionType.TrueFalse,
  durationMiliseconds: ONE_MINUTE_IN_MILISECONDS / 4,
  questionOptions: [
    {
      id: 1,
      option: "False",
    },
    { id: 2, option: "True" },
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
          { id: 1, option: "Answer" },
          { id: 2, option: "Answer" },
          { id: 3, option: "Answer" },
          { id: 4, option: "Answer" },
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
    browseHomeUrl: "/application",
  },
  decorators: (Story) => (
    <div className="bg-black p-10">
      <Story />
    </div>
  ),
} satisfies Meta<typeof Deck>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
