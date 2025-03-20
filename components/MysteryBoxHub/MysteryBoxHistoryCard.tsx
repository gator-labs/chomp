"use client";

import MysteryBoxIcon from "@/public/images/MysteryBoxIcon.png";
import { MysteryBox } from "@/types/mysteryBox";
import Image from "next/image";

import MysteryBoxCategoryPill from "./MysteryBoxCategoryPill";

type MysteryBoxHistoryCardProps = {
  box: MysteryBox;
};

function MysteryBoxHistoryCard({ box }: MysteryBoxHistoryCardProps) {
  const openDate = box.openedAt ? new Date(box.openedAt) : null;

  return (
    <div className="bg-gray-700 rounded-lg p-2 gap-2 flex flex-col">
      <div className="flex justify-between bg-gray-600 rounded-lg p-4">
        <div className="flex gap-4 pl-2">
          <Image src={MysteryBoxIcon} alt="Mystery box" />
          <div className="text-purple-100 text-sm">
            <div>
              Credits{" "}
              <b>{Number(box.creditsReceived).toLocaleString("en-US")}</b>
            </div>
            <div>
              BONK <b>{Number(box.bonkReceived).toLocaleString("en-US")}</b>
            </div>
          </div>
        </div>
        <div className="text-purple-100 text-sm">
          {openDate ? (
            <>
              <div className="text-right">Opened on</div>
              <div className="text-right">
                <b>
                  {new Date(openDate)?.toLocaleString("en-US", {
                    month: "short",
                    timeZone: "UTC",
                  })}{" "}
                  {openDate?.getUTCDate()}
                </b>{" "}
                {openDate?.getUTCFullYear()}
              </div>
            </>
          ) : (
            <div className="text-right">Not opened</div>
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <MysteryBoxCategoryPill category={box.category} />
        {/*<div className="flex items-center align-center gap-2 text-gray-400 text-sm">
          View reward breakdown
          <ChevronRightIcon />
        </div>*/}
      </div>
    </div>
  );
}

export default MysteryBoxHistoryCard;
