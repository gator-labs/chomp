"use client";

import { formatAddress } from "@/app/utils/wallet";
import { useEffect, useState } from "react";

import { Button } from "../../app/components/Button/Button";
import CheckMarkIconSimple from "../../app/components/Icons/CheckMarkIconSimple";
import { CopyIconSimple } from "../../app/components/Icons/CopyIconSimple";

type ProfileWalletAddressButtonProps = {
  address: string;
};

export function ProfileWalletAddressButton({
  address,
}: ProfileWalletAddressButtonProps) {
  const [isCopyingAddress, setIsCopyingAddress] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleAddressClick = () => {
    navigator.clipboard.writeText(address);
    setIsCopyingAddress(true);

    const id = setTimeout(() => {
      setIsCopyingAddress(false);
    }, 2000);
    setTimeoutId(id);
  };

  useEffect(() => {
    return () => {
      // Cleanup the timeout if component unmounts
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <Button
      className="text-sm font-normal inline-flex items-center gap-2 !border-0 bg-gray-700 !w-fit"
      isPill
      size="small"
      variant={isCopyingAddress ? "green" : "secondary"}
      onClick={isCopyingAddress ? undefined : handleAddressClick}
    >
      {isCopyingAddress ? (
        <div className="font-normal flex items-center justify-between w-full">
          <span>Copied</span>
          <div className="ml-2">
            <CheckMarkIconSimple width={16} height={16} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full font-normal">
          <span>{formatAddress(address)}</span>
          <div className="ml-2">
            <CopyIconSimple width={16} height={16} />
          </div>
        </div>
      )}
    </Button>
  );
}
