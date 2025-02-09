"use client";

import MysteryBoxHistory from "@/components/MysteryBoxHub/MysteryBoxHistory";
import MysteryBoxIcon from "@/public/images/validation-mystery-box.png";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

import { InfoIcon } from "../../app/components/Icons/InfoIcon";
import InfoDrawer from "../../app/components/InfoDrawer/InfoDrawer";
import MysteryBoxReward from "../../app/components/MysteryBoxReward/MysteryBoxReward";

interface MysteryBoxHubProps {
  isUserEligibleForValidationReward: boolean;
}

function MysteryBoxHub({
  isUserEligibleForValidationReward,
}: MysteryBoxHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const refreshHistory = () => {
    queryClient.invalidateQueries({ queryKey: ["mystery-boxes"] });
  };
  return (
    <>
      <InfoDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="What is a Mystery Box?"
      >
        <p className="text-sm mb-6">
          Mystery Boxes are your gateway to exciting rewards! Each box contains
          surprises like credits or BONK that you can earn through different
          activities. The more you CHOMP, the more boxes you unlock!
        </p>
      </InfoDrawer>
      <div className="bg-darkGray50 rounded-2xl p-2">
        <h1 className="flex items-center justify-center">
          <span className="bg-blue-pink-gradient text-transparent bg-clip-text font-black text-4xl py-2 mx-auo text-center">
            MYSTERY BOXES
          </span>
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
          onClaim={refreshHistory}
        />
      </div>
      <hr className="border-gray-600 my-2 p-0" />
      <MysteryBoxHistory />
    </>
  );
}

export default MysteryBoxHub;
