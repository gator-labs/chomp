"use client";

import { useRouter } from "next/navigation";
import { Button } from "../Button/Button";
import { ChompGraphic } from "../Graphics/ChompGraphic";
import { TelegramIcon } from "../Icons/TelegramIcon";
import { TwitterIcon } from "../Icons/TwitterIcon";

type NoQuestionsCardProps = {
  browseHomeUrl?: string;
};

export function NoQuestionsCard({ browseHomeUrl }: NoQuestionsCardProps) {
  const isDailyDeck = !!browseHomeUrl;

  const router = useRouter();

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="questions-card text-white font-sora relative">
        <div>
          <div className="text-xl font-semibold mb-2">Fantastic!</div>
          <div className="text-sm max-w-72">
            {isDailyDeck ? (
              <>
                You chomped through your Daily Deck. Now you can browse other
                questions on your homepage!
              </>
            ) : (
              <>
                Thanks for chomping through our closed Alpha!
                <br />
                <br />
                Waddle over to our Telegram or Twitter to get notified when
                Chomp is ready for you to play again :)
              </>
            )}
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div className="text-sm max-w-44">
            Free questions unlocks every 24 hours!
          </div>
          <div>
            <ChompGraphic className="absolute bottom-0 right-0" />
          </div>
        </div>
      </div>
      {isDailyDeck ? (
        <Button
          variant="pink"
          size="big"
          className="mt-2"
          onClick={() => {
            router.replace(browseHomeUrl);
            router.refresh();
          }}
        >
          Browse Home
        </Button>
      ) : (
        <div className="flex gap-4 mt-2">
          <Button
            variant="pink"
            size="big"
            onClick={() => {
              window.open("https://twitter.com/chompdotgames", "_blank");
            }}
          >
            <TwitterIcon width={18} height={18} fill="#000" />
          </Button>
          <Button
            variant="pink"
            size="big"
            onClick={() => {
              window.open("https://t.me/+3Ava3bLuNd85MGVl", "_blank");
            }}
          >
            <TelegramIcon width={21} height={21} fill="#000" />
          </Button>
        </div>
      )}
    </div>
  );
}
