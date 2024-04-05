"use client";

import { useRouter } from "next/navigation";
import { Button } from "../Button/Button";
import { ChompGraphic } from "../Graphics/ChompGraphic";

type NoQuestionsCardProps = {
  browseHomeUrl: string;
};

export function NoQuestionsCard({ browseHomeUrl }: NoQuestionsCardProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="questions-card text-white font-sora relative">
        <div>
          <div className="text-xl font-semibold mb-2">Fantastic!</div>
          <div className="text-sm max-w-72">
            You chomped through 3 questions today.
            <br />
            <br />
            Go back to Home for more stacks to chomp through, or sharpen your
            teeth for another set of Daily Chomps tomorrow!
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
      <Button
        variant="pink"
        size="big"
        className="mt-2"
        onClick={() => {
          if (browseHomeUrl) {
            router.replace(browseHomeUrl);
            router.refresh();
          }
        }}
      >
        Browse home
      </Button>
    </div>
  );
}
