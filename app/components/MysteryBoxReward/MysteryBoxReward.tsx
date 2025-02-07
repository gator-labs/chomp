import { rewardMysteryBoxHub } from "@/app/actions/mysteryBox/rewardMysteryBoxHub";
import { useToast } from "@/app/providers/ToastProvider";
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
  onClaim,
}: {
  title: string;
  type: EMysteryBoxCategory;
  isActive: boolean;
  icon: StaticImageData;
  onClaim?: () => void;
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
        onClaim && onClaim();
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
        className={`flex flex-row items-center rounded-lg bg-blue-pink-gradient p-[1px] ${
          isActive ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
        <div
          className={`flex flex-row items-center rounded-lg px-6 border-2 border-[#0000] [background:var(--bg-color)] w-full ${
            isActive ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          style={
            {
              "--angle": "0deg",
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
