"use client";

import { useRouter } from "next/navigation";
import { Button } from "../Button/Button";
import { TrophyGraphic } from "../Graphics/TrophyGraphic";
import { HalfArrowRightIcon } from "../Icons/HalfArrowRightIcon";

type NoQuestionsCardProps = {
  browseHomeUrl?: string;
  isAnswerPage?: boolean;
};

export function NoQuestionsCard({
  browseHomeUrl,
  isAnswerPage = false,
}: NoQuestionsCardProps) {
  const hasBrowseHome = !!browseHomeUrl;

  const router = useRouter();

  return (
    <div className="flex flex-col justify-between h-full">
      <div
        className="questions-card text-white font-sora relative"
        style={{
          aspectRatio: 0.92,
        }}
      >
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
                still available for you to chomp through under &quot;Home&quot;!
              </>
            ) : (
              <>
                You just chomped through that deck! You&apos;ll be notified when
                this deck is ready to reveal. <br />
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
          className="gap-1 my-[53px]"
          onClick={() => {
            router.replace(browseHomeUrl);
            router.refresh();
          }}
        >
          Home <HalfArrowRightIcon fill="#0D0D0D" />
        </Button>
      )}
    </div>
  );
}
