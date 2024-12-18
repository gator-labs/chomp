"use client";

import { rewardTutorialMysteryBox } from "@/app/actions/mysteryBox/tutorailMysteryBox";
import MysteryBox from "@/components/MysteryBox/MysteryBox";
import React, { useEffect, useState } from "react";

type TutorialMysteryBoxProps = {
  newUser: boolean;
};

const TutorialMysteryBox = ({ newUser }: TutorialMysteryBoxProps) => {
  const [mysteryBoxId, setMysteryBoxId] = useState<string | null>(null);
  const [showMysteryBox, setShowMysteryBox] = useState(false);

  const giftMysteryBox = async () => {
    const mysteryBoxId = await rewardTutorialMysteryBox();
    if (mysteryBoxId) {
      setMysteryBoxId(mysteryBoxId);
      setShowMysteryBox(true);
    }
  };

  useEffect(() => {
    giftMysteryBox();
  }, []);
  return (
    <>
      {" "}
      <MysteryBox
        isOpen={showMysteryBox}
        closeBoxDialog={() => {
          setShowMysteryBox(false);
        }}
        mysteryBoxId={mysteryBoxId}
        isDismissed={false}
        skipAction={"Dismiss"}
      />
    </>
  );
};

export default TutorialMysteryBox;
