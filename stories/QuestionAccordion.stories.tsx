import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import dayjs from "dayjs";
import { Button } from "../app/components/Button/Button";
import { QuestionAccordion } from "../app/components/QuestionAccordion/QuestionAccordion";
import { TrueFalseScale } from "../app/components/TrueFalseScale/TrueFalseScale";

const meta = {
  title: "Cards/Question Accordion",
  component: QuestionAccordion,
  parameters: {
    layout: "centered",
  },
  args: {
    onToggleCollapse: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof QuestionAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    question: "The best way to secure your assets is to use a hardware wallet.",
    isCollapsed: true,
    revealedAt: dayjs().add(-2, "day").toDate(),
  },
};

export const Open: Story = {
  args: {
    question: "The best way to secure your assets is to use a hardware wallet.",
    isCollapsed: false,
    revealedAt: dayjs().add(-2, "day").toDate(),
    children: <TrueFalseScale ratioTrue={50} handleRatioChange={() => {}} />,
    actionChild: (
      <Button variant="white" className="!rounded-full">
        Reveal Results
      </Button>
    ),
  },
};

export const Reveal: Story = {
  args: {
    question: "The best way to secure your assets is to use a hardware wallet.",
    isCollapsed: true,
    revealedAt: dayjs().add(-2, "day").toDate(),
    actionChild: (
      <Button variant="white" className="!rounded-full">
        Reveal Results
      </Button>
    ),
  },
};

export const Chomped: Story = {
  args: {
    question: "The best way to secure your assets is to use a hardware wallet.",
    isCollapsed: true,
    revealedAt: dayjs().add(-2, "day").toDate(),
    status: "chomped",
  },
};

export const New: Story = {
  args: {
    question: "The best way to secure your assets is to use a hardware wallet.",
    isCollapsed: true,
    revealedAt: dayjs().add(-2, "day").toDate(),
    status: "new",
  },
};
