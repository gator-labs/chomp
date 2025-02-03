import { useToast } from "@/app/providers/ToastProvider";
import { rewardMysteryBoxHub } from "@/app/queries/mysteryBox";
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
  const [showBoxOverlay, setShowBoxOverlay] = useState(false);
  const [mystryBoxIds, setMysteryBoxIds] = useState<string[]>([]);

  const { promiseToast } = useToast();

  const rewardBoxHandler = async () => {
    if (!isActive) return;
    try {
      const res = await promiseToast(rewardMysteryBoxHub({ type }), {
        loading: "Opening Mystery Box. Please wait...",
        success: "Mystery Box created successfully! ",
        error: "Failed to open the Mystery Box. Please try again later. 😔",
      });
      if (res) {
        setMysteryBoxIds(res);
      }
    } catch {
      console.log("Failed to open the Mystery Box. Please try again later. 😔");
    } finally {
      setShowBoxOverlay(true);
    }
  };

  return (
    <>
      <div
        className={`flex flex-row items-center rounded-lg px-6 border-2 border-[#0000] [background:var(--bg-color)] ${
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
          rewardBoxHandler();
        }}
      >
        <Image
          src={isActive ? icon : OpenedMysteryBox}
          alt="Mystery box"
          className="w-[140px] h-[140px]"
        />
        <div className="flex flex-col ml-8 gap-4">
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
      {mystryBoxIds.length > 0 && (
        <OpenMysteryBox
          closeBoxDialog={() => setShowBoxOverlay(false)}
          isOpen={showBoxOverlay}
          boxType={type}
          mysteryBoxIds={mystryBoxIds}
        />
      )}
    </>
  );
}

export default MysteryBoxReward;
