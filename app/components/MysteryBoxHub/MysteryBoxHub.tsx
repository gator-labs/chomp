"use client";

import MysteryBoxIcon from "@/public/images/validation-mystery-box.png";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import React, { useState } from "react";

import { InfoIcon } from "../Icons/InfoIcon";
import InfoDrawer from "../InfoDrawer/InfoDrawer";
import MysteryBoxReward from "../MysteryBoxReward/MysteryBoxReward";

interface MysteryBoxHubProps {
  isUserEligibleForValidationReward: boolean;
}

function MysteryBoxHub({
  isUserEligibleForValidationReward,
}: MysteryBoxHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <InfoDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="What is a Mystery Box?"
        description={`Mystery Boxes are your gateway to exciting rewards! Each box contains surprises like credits or BONK that you can earn through different activities. The more you CHOMP, the more boxes you unlock!`}
      />
      <div className="bg-darkGray50 rounded-2xl p-2">
        <h1 className="bg-blue-pink-gradient inline-block text-transparent bg-clip-text font-black text-4xl py-2">
          MYSTERY BOXES
        </h1>
        <div className="flex justify-end items-center mb-2 text-gray-400 gap-2 py-2">
          <div className="text-xs">Learn more about Mystery Boxes</div>
          <button onClick={() => setIsOpen(true)}>
            <InfoIcon width={18} height={18} fill="#999999" />
          </button>
        </div>
        <MysteryBoxReward
          title="Validation Rewards"
          isActive={isUserEligibleForValidationReward}
          icon={MysteryBoxIcon}
          type={EMysteryBoxCategory.Validation}
        />
      </div>
    </>
  );
}

export default MysteryBoxHub;
