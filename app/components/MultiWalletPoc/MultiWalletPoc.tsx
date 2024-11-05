"use client";

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
    <div className="flex flex-col gap-2 mx-5 my-3">
      <Button
        onClick={async () => {
          linkSocialAccount(ProviderEnum.Telegram);
        }}
      >
        Click me to link telegram
      </Button>
      {userWallets.map((wallet: any) => (
        <Button
          variant="outline"
          key={wallet.id}
          onClick={() => switchWallet(wallet.id)}
        >
          Click me to connect {wallet.address.slice(0, 4)}...
          {wallet.address.slice(-4)} for txn
        </Button>
      ))}
    </div>
  );
}
