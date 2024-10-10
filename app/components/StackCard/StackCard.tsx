"use client";

import { STACKS_PATH } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightCircle } from "../Icons/ArrowRightCircle";

type StackCardProps = {
  id: number;
  imageSrc: string;
  name: string;
  decksToAnswer?: number;
  decksToReveal?: number;
};

const StackCard = ({
  id,
  imageSrc,
  name,
  decksToAnswer,
  decksToReveal,
}: StackCardProps) => {
  return (
    <Link
      href={`${STACKS_PATH}/${id}`}
      className="p-4 rounded-[8px] bg-gray-800 border-[0.5px] border-solid border-gray-500 flex items-center justify-between gap-4"
      style={{
        pointerEvents:
          decksToAnswer === 0 && decksToReveal === 0 ? "none" : "auto",
      }}
    >
      <div className="relative w-[52px] h-[52px]">
        <Image
          src={imageSrc}
          fill
          alt={name}
          className="rounded-full object-cover"
          sizes="(max-width: 600px) 40px, (min-width: 601px) 52px"
        />
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <h3 className="text-white text-sm font-bold">{name}</h3>
        {decksToAnswer !== undefined && decksToReveal !== undefined ? (
          decksToAnswer === 0 && decksToReveal === 0 ? (
            <p className="text-xs font-medium text-gray-400">Coming soon</p>
          ) : (
            <p className="text-xs font-medium text-gray-400">
              <span className="text-white">{decksToAnswer}</span> deck
              {decksToAnswer === 1 ? "" : "s"} to answer{" "}
              <span className="text-white">•</span>{" "}
              <span className="text-white">{decksToReveal}</span> deck
              {decksToReveal === 1 ? "" : "s"} to reveal
            </p>
          )
        ) : null}
      </div>
      {!(decksToAnswer === 0 && decksToReveal === 0) && (
        <div className="flex-shrink-0">
          <ArrowRightCircle />
        </div>
      )}
    </Link>
  );
};

export default StackCard;
