import MysteryBoxCategoryPill from "@/components/MysteryBoxHub/MysteryBoxCategoryPill";
import OpenMysteryBox from "@/components/MysteryBoxHub/OpenMysteryBox";
import OpenedMysteryBox from "@/public/images/opened-mystery-box.png";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import classNames from "classnames";
import Image, { StaticImageData } from "next/image";
import React, { CSSProperties, useState } from "react";

function MysteryBoxReward({
  title,
  type,
  isActive,
  icon,
}: {
  title: string;
  type: EMysteryBoxCategory;
  isActive: boolean;
  icon: StaticImageData;
}) {
  const [openMysteryBox, setOpenMysteryBox] = useState(false);
  return (
    <>
      <div
        className={`flex flex-row rounded-lg p-6 border-2 border-[#0000] [background:var(--bg-color)] ${
          isActive ? "cursor-pointer" : "cursor-not-allowed"
        }`}
        style={
          {
            "--angle": "0deg",
            "--border-color":
              "linear-gradient(var(--angle), #F9F1FB 0%, #89C9FF 29%, #AF7CE7 59.5%, #FBD7FF 100%)",
            "--bg-color":
              "linear-gradient(180deg, #5f5bd733 0%, #00000033 50%, #5f5bd733 100%), #333",
          } as CSSProperties
        }
        onClick={() => {
          if (isActive) {
            setOpenMysteryBox(true);
          }
        }}
      >
        <Image
          src={isActive ? icon : OpenedMysteryBox}
          alt="Mystery box"
          width={120}
          height={84}
        />
        <div className="flex flex-col items-start justify-between ml-8 gap-4">
          <h1
            className={classNames(
              "text-base inline-block text-transparent bg-clip-text font-black",
              {
                "bg-gray-400": !isActive,
                "bg-blue-pink-gradient": isActive,
              },
            )}
          >
            {title}
          </h1>
          <p className={classNames("text-purple-100 text-xs  font-black")}>
            {isActive ? "OPEN NOW!" : "Come back later!"}
          </p>
          <MysteryBoxCategoryPill category={type} disabled={!isActive} />
        </div>
      </div>
      <OpenMysteryBox
        closeBoxDialog={() => setOpenMysteryBox(false)}
        isOpen={openMysteryBox}
        boxType={type}
      />
    </>
  );
}

export default MysteryBoxReward;
