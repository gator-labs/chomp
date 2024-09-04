"use client";

import classNames from "classnames";
import Image from "next/image";
import { DeckGraphic } from "../Graphics/DeckGraphic";
import CardsIcon from "../Icons/CardsIcon";
import { RevealCardInfo } from "../RevealCardInfo/RevealCardInfo";

type StatusUnion = "chomped" | "new" | "continue";
type HomeFeedDeckCardProps = {
  deck: string;
  imageUrl?: string | null;
  revealAtDate?: Date | null;
  answerCount?: number;
  revealAtAnswerCount?: number;
  status?: StatusUnion;
  deckId: number;
};

const getStatusText = (status: StatusUnion) => {
  switch (status) {
    case "chomped":
      return "Chomped";
    case "continue":
      return "Continue";
    case "new":
      return "New !";
    default:
      return "";
  }
};

export function HomeFeedDeckCard({
  deck,
  imageUrl,
  revealAtDate,
  answerCount,
  revealAtAnswerCount,
  status,
  deckId,
}: HomeFeedDeckCardProps) {
  return (
    <a
      href={`application/decks/${deckId}`}
      className="bg-gray-800 border-gray-600 rounded-2xl p-4 flex gap-4 cursor-pointer h-full"
    >
      <div className="w-[90px] h-[90px] flex-shrink-0 relative">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <>
            <CardsIcon className="absolute top-0 left-0 w-full h-full" />
            <Image
              src={imageUrl}
              alt="logo"
              width={36}
              height={36}
              className="z-10 absolute w-9 h-9 rounded-full top-1/2 left-1/2 translate-x-[-50%] -translate-y-1/2 object-cover"
            />
          </>
        ) : (
          <DeckGraphic className="w-full h-full" />
        )}
      </div>
      <div className="flex flex-col justify-between w-full">
        <div className="text-white font-sora font-semibold text-base">
          {deck}
        </div>
        <div className="flex items-center justify-between -ml-1">
          <RevealCardInfo
            answerCount={answerCount}
            revealAtAnswerCount={revealAtAnswerCount}
            revealAtDate={revealAtDate}
          />
          <div
            className={classNames("text-sm leading-6", {
              "text-aqua": status && ["chomped", "continue"].includes(status),
              "text-gray": status === "new",
              underline: status === "continue",
            })}
          >
            {status && getStatusText(status)}
          </div>
        </div>
      </div>
    </a>
  );
}
