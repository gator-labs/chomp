"use client";

import HourGlassIcon from "@/app/components/Icons/HourGlassIcon";
import PreviewDeckCard from "@/app/components/PreviewDeckCard";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";

type NotActiveDeckProps = {
  deckName: string | undefined;
  deckInfo:
    | {
        description: string | null;
        footer: string | null;
        imageUrl: string | null;
      }
    | undefined;
  stackImage: string | undefined;
  totalNumberOfQuestions: number | undefined;
  activeFrom: Date | null;
  deckCost: number | null;
};

const NotActiveDeck = ({
  deckName,
  deckInfo,
  stackImage,
  totalNumberOfQuestions,
  activeFrom,
  deckCost,
}: NotActiveDeckProps) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (activeFrom === null) {
        return;
      }
      const now = new Date();
      const startDate = new Date(activeFrom);
      const timeDifference = startDate.getTime() - now.getTime();

      if (timeDifference <= 0) {
        setTimeLeft("The deck is now active!");
        window.location.reload();
        return;
      }

      const days = Math.floor(timeDifference / (1000 * 3600 * 24));
      const hours = Math.floor(
        (timeDifference % (1000 * 3600 * 24)) / (1000 * 3600),
      );
      const minutes = Math.floor(
        (timeDifference % (1000 * 3600)) / (1000 * 60),
      );

      let timeString = "Starts in ";

      if (days > 0) timeString += `${days} days `;
      if (hours > 0) timeString += `${hours} hours `;
      if (minutes > 0) timeString += `${minutes} minutes`;

      if (days === 0 && hours === 0 && minutes === 0) {
        timeString = "Starts in less than a minute";
      }

      setTimeLeft(timeString);
    };

    const intervalId = setInterval(calculateTimeLeft, 1000);

    calculateTimeLeft();

    return () => clearInterval(intervalId);
  }, [activeFrom]);

  return (
    <div className="flex flex-col font-sora bg-gray-950 text-white h-full w-full mx-auto pt-14 gap-2 items-between">
      <PreviewDeckCard
        deckCost={deckCost}
        {...deckInfo}
        heading={deckName || ""}
        stackImage={stackImage || ""}
        totalNumberOfQuestions={totalNumberOfQuestions || 0}
      />
      <div className="flex flex-col mt-auto gap-y-[16px] mb-[16px] w-full">
        <Button disabled>
          {timeLeft}
          <HourGlassIcon fill="none" />
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            router.push("/application");
          }}
        >
          Back to home page
        </Button>
      </div>
    </div>
  );
};

export default NotActiveDeck;
