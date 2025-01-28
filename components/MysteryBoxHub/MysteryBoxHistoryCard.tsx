"use client";

import { ChevronRightIcon } from "@/app/components/Icons/ChevronRightIcon";
import MysteryBoxIcon from "@/public/images/MysteryBoxIcon.png";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import Image from "next/image";

import MysteryBoxCategoryPill from "./MysteryBoxCategoryPill";

type MysteryBox = {
  credits: number;
  bonk: number;
  openedAt: string;
  category: EMysteryBoxCategory;
};

type MysteryBoxHistoryCardProps = {
  box: MysteryBox;
};

function MysteryBoxHistoryCard({ box }: MysteryBoxHistoryCardProps) {
  const openDate = new Date(box.openedAt);

  return (
    <div className="bg-gray-700 rounded-lg p-2 gap-2 flex flex-col">
      <div className="flex justify-between bg-gray-600 rounded-lg p-4">
        <div className="flex gap-4 pl-2">
          <Image src={MysteryBoxIcon} alt="Mystery box" />
          <div className="text-purple-100 text-sm">
            <div>
              Credits <b>{box.credits.toLocaleString("en-US")}</b>
            </div>
            <div>
              BONK <b>{box.bonk.toLocaleString("en-US")}</b>
            </div>
          </div>
        </div>
        <div className="text-purple-100 text-sm">
          <div className="text-right">Opened on</div>
          <div className="text-right">
            <b>
              {openDate.toLocaleString("en-US", { month: "short" })}{" "}
              {openDate.getDate()}
            </b>{" "}
            {openDate.getFullYear()}
          </div>
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
