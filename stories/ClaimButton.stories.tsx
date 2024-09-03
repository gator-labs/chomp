import ClaimButton from "@/app/components/ClaimButton/ClaimButton";
import { ToastProvider } from "@/app/providers/ToastProvider";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Reveal/Claim button",
  component: ClaimButton,
  parameters: {
    layout: "centered",
  },
  args: {
    questionIds: [],
    status: "claimable",
    rewardAmount: 10000,
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <ToastProvider>
      <div className=" p-2">
        <Story />
      </div>
    </ToastProvider>
  ),
} satisfies Meta<typeof ClaimButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DidNotAnswer: Story = {
  args: {
    didAnswer: false,
    transactionHash: "",
  },
};

export const Claimable: Story = {
  args: {
    status: "claimable",
    transactionHash: "",
  },
};

export const Claimed: Story = {
  args: {
    status: "claimed",
    transactionHash: "",
  },
};

export const Unclaimable: Story = {
  args: {
    status: "unclaimable",
    transactionHash: "",
  },
};
