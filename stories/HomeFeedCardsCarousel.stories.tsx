import { HomeFeedCardCarousel } from "@/app/components/HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedQuestionCard } from "@/app/components/HomeFeedQuestionCard/HomeFeedQuestionCard";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import dayjs from "dayjs";

const meta = {
  title: "Cards/Home Feed Card Carousel",
  component: HomeFeedCardCarousel,
  parameters: {
    layout: "centered",
  },
  args: {},
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HomeFeedCardCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: (
      <h2 className="text-black text-base">
        Check out others' revealed questions
      </h2>
    ),
    slides: [
      <HomeFeedQuestionCard
        revealAtDate={dayjs(new Date()).add(1, "day").toDate()}
        question="The best way to secure your assets is to use a hardware wallet"
        onClear={fn()}
        onView={fn()}
      />,
      <HomeFeedQuestionCard
        revealAtDate={dayjs(new Date()).add(1, "day").toDate()}
        question="The best way to secure your assets is to use a hardware wallet"
        onClear={fn()}
        onView={fn()}
      />,
      <HomeFeedQuestionCard
        revealAtDate={dayjs(new Date()).add(1, "day").toDate()}
        question="The best way to secure your assets is to use a hardware wallet"
        onClear={fn()}
        onView={fn()}
      />,
    ],
  },
};
