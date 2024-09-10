"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightCircle } from "../Icons/ArrowRightCircle";

type CampaignCardProps = {
  id: number;
  imageSrc: string;
  name: string;
  decksToAnswer?: number;
  decksToReveal?: number;
};

const CampaignCard = ({
  id,
  imageSrc,
  name,
  decksToAnswer,
  decksToReveal,
}: CampaignCardProps) => {
  return (
    <Link
      href={`/application/campaigns/${id}`}
      className="p-4 rounded-[8px] bg-gray-850 border-[0.5px] border-solid border-gray-600 flex items-center justify-between gap-4"
    >
      <Image
        src={imageSrc}
        width={52}
        height={52}
        alt={name}
        className="rounded-full"
      />
      <div className="flex flex-col gap-3 flex-1">
        <h3 className="text-white text-[14px] leading-[18.9px] font-[700]">
          {name}
        </h3>
        {decksToAnswer !== undefined && decksToReveal !== undefined && (
          <p className="text-xs font-[500] text-gray-400">
            <span className="text-white">{decksToAnswer}</span> deck
            {decksToAnswer === 1 ? "" : "s"} to answer{" "}
            <span className="text-white">•</span>{" "}
            <span className="text-white">{decksToReveal}</span> deck
            {decksToReveal === 1 ? "" : "s"} to reveal
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        <ArrowRightCircle />
      </div>
    </Link>
  );
};

export default CampaignCard;
