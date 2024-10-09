"use client";

import { STACKS_PATH } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightCircle } from "../Icons/ArrowRightCircle";

type StackCardProps = {
  id: number;
  imageSrc: string;
  name: string;
  numberOfDecks: number;
  decksToAnswer?: number;
  decksToReveal?: number;
};

const StackCard = ({
  id,
  imageSrc,
  name,
  decksToAnswer,
  decksToReveal,
  numberOfDecks,
}: StackCardProps) => {
  return (
    <Link
      href={numberOfDecks > 0 ? `${STACKS_PATH}/${id}` : ""}
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
        />
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <h3 className="text-white text-sm font-bold">{name}</h3>
        {numberOfDecks === 0 && (
          <p className="text-xs font-medium text-gray-400">Coming soon</p>
        )}

        {decksToAnswer !== undefined &&
          decksToReveal !== undefined &&
          numberOfDecks > 0 && (
            <p className="text-xs font-medium text-gray-400">
              <span className="text-white">{decksToAnswer}</span> deck
              {decksToAnswer === 1 ? "" : "s"} to answer{" "}
              <span className="text-white">•</span>{" "}
              <span className="text-white">{decksToReveal}</span> deck
              {decksToReveal === 1 ? "" : "s"} to reveal
            </p>
          )}
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
