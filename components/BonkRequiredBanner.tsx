"use client";

import bonkBgImage from "@/public/images/bonk_bg.png";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function BonkRequiredBanner() {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const handleDismiss = async () => {
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="flex gap-2 bg-purple-400 rounded-md text-sm font-medium p-3 mb-2 relative overflow-hidden">
      <Image
        src={bonkBgImage}
        alt="BONK"
        className="absolute w-[166px] h-[164px] left-[-44px] top-[-20px] z-10 opacity-10"
      />
      <div className="flex flex-col gap-4 z-20">
        <div>BONK required to open a box.</div>

        <div>
          Transfer some BONK into your wallet and refresh the page to open a
          box!
        </div>
      </div>

      <div>
        <span className="cursor-pointer" onClick={handleDismiss}>
          <X size={20} />
        </span>
      </div>
    </div>
  );
}
