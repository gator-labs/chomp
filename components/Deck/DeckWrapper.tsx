import { DeckGraphic } from "@/app/components/Graphics/DeckGraphic";
import CardsIcon from "@/app/components/Icons/CardsIcon";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { ReactNode } from "react";

interface DeckWrapperProps {
  wrapperType: "a" | "div";
  linkPath?: string;
  onClick?: () => void;
  children: ReactNode;
  answeredQuestions: number | undefined;
  imageUrl?: string | null;
  totalQuestions?: number;
  deckTitle: string;
  progressPercentage: number;
}

const DeckWrapper: React.FC<DeckWrapperProps> = ({
  wrapperType,
  linkPath,
  onClick,
  children,
  answeredQuestions,
  imageUrl,
  totalQuestions,
  progressPercentage,
  deckTitle,
}) => {
  return wrapperType === "a" ? (
    <a
      onClick={onClick}
      href={linkPath}
      className={cn(
        "bg-gray-700 rounded-2xl p-2 flex flex-col gap-2 h-full cursor-pointer",
        {
          "bg-chomp-indigo-dark": answeredQuestions && answeredQuestions > 0,
        },
      )}
    >
      <div className="flex bg-gray-800 p-2 rounded-2xl gap-2 items-center relative">
        {!(answeredQuestions === totalQuestions) && (
          <div
            className="absolute top-0 left-0 h-full bg-green opacity-35 z-0 rounded-l-2xl"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        )}
        <div className="w-[59px] h-[60px] bg-purple-500 rounded-xl flex-shrink-0 relative p-1">
          {imageUrl ? (
            <>
              <CardsIcon className="absolute top-0 left-0 w-full h-full" />
              <Image
                src={imageUrl}
                alt="logo"
                width={36}
                height={36}
                className="z-10 absolute w-8 h-8 rounded-full top-1/2 left-1/2 translate-x-[-50%] -translate-y-1/2 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/chompy.png";
                }}
              />
            </>
          ) : (
            <DeckGraphic className="w-full h-full" />
          )}
        </div>
        <div className="text-white font-semibold text-base line-clamp-2 z-10">
          {deckTitle}
        </div>
      </div>
      {children}
    </a>
  ) : (
    <div
      onClick={onClick}
      className={cn(
        "bg-gray-700 rounded-2xl p-2 flex flex-col gap-2 h-full cursor-pointer",
        {
          "bg-chomp-indigo-dark": answeredQuestions && answeredQuestions > 0,
        },
      )}
    >
      <div className="flex bg-gray-800 p-2 rounded-2xl gap-2 items-center relative">
        {!(answeredQuestions === totalQuestions) && (
          <div
            className="absolute top-0 left-0 h-full bg-green opacity-35 z-0 rounded-l-2xl"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        )}
        <div className="w-[59px] h-[60px] bg-purple-500 rounded-xl flex-shrink-0 relative p-1">
          {imageUrl ? (
            <>
              <CardsIcon className="absolute top-0 left-0 w-full h-full" />
              <Image
                src={imageUrl}
                alt="logo"
                width={36}
                height={36}
                className="z-10 absolute w-8 h-8 rounded-full top-1/2 left-1/2 translate-x-[-50%] -translate-y-1/2 object-cover"
              />
            </>
          ) : (
            <DeckGraphic className="w-full h-full" />
          )}
        </div>
        <div className="text-white font-semibold text-base line-clamp-2 z-10">
          {deckTitle}
        </div>
      </div>
      {children}
    </div>
  );
};

export default DeckWrapper;
