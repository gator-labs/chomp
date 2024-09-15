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
      href={`/campaigns/${id}`}
      className="p-4 rounded-[8px] bg-gray-800 border-[0.5px] border-solid border-gray-500 flex items-center justify-between gap-4"
    >
      <div className="relative w-[52px] h-[52px]">
        <Image
          src={imageSrc}
          fill
          alt={name}
          className="rounded-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <h3 className="text-white text-sm font-bold">{name}</h3>
        {decksToAnswer !== undefined && decksToReveal !== undefined && (
          <p className="text-xs font-medium text-gray-400">
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
