"use client";

import { Button } from "@/app/components/Button/Button";
import { CoinStackIcon } from "@/app/components/Icons/CoinStackIcon";
import BuyBulkCreditsDrawer from "@/components/BuyBulkCreditsDrawer";
import { useState } from "react";

export type BuyBulkCreditsButtonProps = {
  text?: string;
  size: "small" | "tiny";
};

export function BuyBulkCreditsButton({
  text,
  size,
}: BuyBulkCreditsButtonProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        className="text-sm font-normal inline-flex items-center gap-2 !border-0 !w-fit"
        variant="blue"
        isPill
        size={size}
        onClick={() => setIsDrawerOpen(true)}
      >
        {text ?? ""}
        <CoinStackIcon />+
      </Button>
      <BuyBulkCreditsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
