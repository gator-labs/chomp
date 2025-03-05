import { rewardMysteryBoxHub } from "@/app/actions/mysteryBox/rewardMysteryBoxHub";
import { useToast } from "@/app/providers/ToastProvider";
import MysteryBoxCategoryPill from "@/components/MysteryBoxHub/MysteryBoxCategoryPill";
import OpenMysteryBox from "@/components/MysteryBoxHub/OpenMysteryBox";
import OpenedMysteryBox from "@/public/images/opened-mystery-box.png";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import classNames from "classnames";
import Image, { StaticImageData } from "next/image";
import React, { CSSProperties, useState } from "react";

import { InfoIcon } from "../Icons/InfoIcon";
import InfoDrawer from "../InfoDrawer/InfoDrawer";

function MysteryBoxReward({
  title,
  type,
  isActive,
  icon,
  infoTitle,
  infoBody,
  campaignBoxId,
}: {
  title: string;
  type: EMysteryBoxCategory;
  isActive: boolean;
  icon: StaticImageData;
  infoTitle?: string;
  infoBody?: string;
  campaignBoxId?: string;
}) {
  const [showBoxOverlay, setShowBoxOverlay] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [mystryBoxIds, setMysteryBoxIds] = useState<string[]>([]);

  const { promiseToast, infoToast } = useToast();

  const showTooltip = !!infoBody && !!infoTitle && !isActive;

  const rewardBoxHandler = async () => {
    if (!isActive) return;
    if (isSubmitting) {
      infoToast("Please wait while we are processing you reward!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await promiseToast(
        rewardMysteryBoxHub({ type, campaignBoxId }),
        {
          loading: "Opening Mystery Box. Please wait...",
          success: "Mystery Box created successfully! ",
          error: "Failed to open the Mystery Box. Please try again later. 😔",
        },
      );
      if (res) {
        setMysteryBoxIds(res);
      }
    } catch {
      console.log("Failed to open the Mystery Box. Please try again later. 😔");
    } finally {
      setIsSubmitting(false);
      setShowBoxOverlay(true);
    }
  };

  return (
    <>
      <InfoDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={infoTitle ? infoTitle : "What's this?"}
      >
        <p className="text-sm mb-6">{infoBody}</p>
      </InfoDrawer>
      <div
        className={`flex flex-row items-center rounded-lg bg-blue-pink-gradient p-[1px]`}
      >
        <div
          className={`flex flex-row items-center rounded-lg px-3 md:px-6 border-2 border-[#0000] [background:var(--bg-color)] w-full ${
            isActive || showTooltip ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          style={
            {
              "--angle": "0deg",
              "--bg-color":
                "linear-gradient(180deg, #5f5bd733 0%, #00000033 50%, #5f5bd733 100%), #333",
            } as CSSProperties
          }
          onClick={() => {
            if (showTooltip) {
              setIsOpen(true);
            }

            if (isActive) {
              rewardBoxHandler();
            }
          }}
        >
          <Image
            src={isActive ? icon : OpenedMysteryBox}
            alt="Mystery box"
            className="w-[140px] h-[140px]"
          />
          <div className="flex flex-col ml-4 md:ml-8 gap-4">
            <h1
              className={classNames(
                "text-sm md:text-base inline-block text-transparent bg-clip-text font-black",
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
            <div className="flex flex-row gap-1 justify-start items-center">
              <MysteryBoxCategoryPill category={type} disabled={!isActive} />
              <button
                className={classNames({
                  visible: showTooltip,
                  hidden: !showTooltip,
                })}
              >
                <InfoIcon width={18} height={18} fill="#fff" />
              </button>
            </div>
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
