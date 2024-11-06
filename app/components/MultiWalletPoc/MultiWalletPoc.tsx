"use client";

import { formatAddress } from "@/app/utils/wallet";
import { ProviderEnum } from "@dynamic-labs/sdk-api-core";
import {
  useSocialAccounts,
  useSwitchWallet,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";

import { Button } from "../ui/button";

export function MultiWalletPoc() {
  const switchWallet = useSwitchWallet();
  const userWallets = useUserWallets();
  const { linkSocialAccount } = useSocialAccounts();

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={async () => {
          linkSocialAccount(ProviderEnum.Telegram);
        }}
        isPill
      >
        Click me to link telegram
      </Button>
      {userWallets.map((wallet: any) => (
        <Button
          variant="outline"
          key={wallet.id}
          onClick={() => switchWallet(wallet.id)}
          isPill
        >
          Connect {formatAddress(wallet.address)} for Transaction
        </Button>
      ))}
    </div>
  );
}
