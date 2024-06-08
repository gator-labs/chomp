import { ToastProvider } from "@chomp/app/providers/ToastProvider";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import type { Meta, StoryObj } from "@storybook/react";
import { WalletWidget } from "../app/components/WalletWidget/WalletWidget";

const meta = {
  title: "Wallet widget",
  component: WalletWidget,
  parameters: {
    layout: "centered",
  },
  args: {
    address: "BqcQDyZLW1mL14MgfwMsLkifNScDUTmks55R8x1uAwox",
  },
  tags: ["autodocs"],
  decorators: (Story) => (
    <div className="h-96 w-96">
      <DynamicContextProvider
        settings={{
          environmentId: "PLACEHOLDER",
        }}
      >
        <ToastProvider>
          <Story />
        </ToastProvider>
      </DynamicContextProvider>
    </div>
  ),
} satisfies Meta<typeof WalletWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
