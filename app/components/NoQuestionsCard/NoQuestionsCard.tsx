"use client";

import { useRouter } from "next/navigation";
import { Button } from "../Button/Button";
import { TrophyGraphic } from "../Graphics/TrophyGraphic";
import { HalfArrowRightIcon } from "../Icons/HalfArrowRightIcon";

type NoQuestionsCardProps = {
  browseHomeUrl?: string;
  isAnswerPage: boolean;
};

export function NoQuestionsCard({
  browseHomeUrl,
  isAnswerPage = false,
}: NoQuestionsCardProps) {
  const hasBrowseHome = !!browseHomeUrl;

  const router = useRouter();

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="questions-card text-white font-sora relative">
        <div>
          {isAnswerPage && (
            <div className="text-2xl font-bold mb-2">Wait, is there more?</div>
          )}
          {!isAnswerPage && (
            <div className="text-2xl font-bold mb-2">Nice!</div>
          )}
          <div className="text-sm max-w-72 relative z-10">
            {isAnswerPage ? (
              <>
                There just might be! <br /> <br /> Check out what decks are
                still available for you to chomp through under "Home"!
              </>
            ) : (
              <>
                You just chomped through that deck! You'll be notified when this
                deck is ready to reveal. <br />
                <br /> Meanwhile, go check out some more chomps in{" "}
                <b>
                  <u>answer</u>
                </b>{" "}
                page or go back{" "}
                <b>
                  <u>home</u>
                </b>{" "}
                to check for more decks.
              </>
            )}
          </div>
        </div>
        <TrophyGraphic className="absolute bottom-2.5 right-4" />
      </div>
      {hasBrowseHome && (
        <Button
          variant="pink"
          size="big"
          className="mt-2 flex items-center"
          onClick={() => {
            router.replace(browseHomeUrl);
            router.refresh();
          }}
        >
          <div className="mr-1">Home</div> <HalfArrowRightIcon fill="#000" />
        </Button>
      )}
    </div>
  );
}
