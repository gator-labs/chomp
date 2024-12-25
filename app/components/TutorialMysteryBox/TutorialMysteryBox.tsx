"use client";

import MysteryBox from "@/components/MysteryBox/MysteryBox";
import { EMysteryBoxType } from "@/types/mysteryBox";
import React, { useEffect, useState } from "react";

type TutorialMysteryBoxProps = {
  mysteryBoxId: string | null;
};

const TutorialMysteryBox = ({ mysteryBoxId }: TutorialMysteryBoxProps) => {
  const [showMysteryBox, setShowMysteryBox] = useState(false);

  useEffect(() => {
    if (mysteryBoxId) {
      setShowMysteryBox(true);
    }
  }, [mysteryBoxId]);

  return (
    <>
      <MysteryBox
        isOpen={showMysteryBox}
        closeBoxDialog={() => {
          setShowMysteryBox(false);
        }}
        mysteryBoxId={mysteryBoxId}
        isDismissed={false}
        skipAction={"Dismiss"}
        boxType={EMysteryBoxType.Tutorial}
      />
    </>
  );
};

export default TutorialMysteryBox;
