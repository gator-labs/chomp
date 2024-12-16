"use client";

import MysteryBox from "@/components/MysteryBox/MysteryBox";
import { useState } from "react";

export const ReopenMysteryBox = ({
  mysteryBoxId,
}: {
  mysteryBoxId: string;
}) => {
  const [showMysteryBox, setShowMysteryBox] = useState(true);

  return (
    <>
      <MysteryBox
        isOpen={showMysteryBox}
        closeBoxDialog={() => {
          setShowMysteryBox(false);
        }}
        mysteryBoxId={mysteryBoxId}
        isDismissed={true}
        skipAction={"Close"}
      />
    </>
  );
};
