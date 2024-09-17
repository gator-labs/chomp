"use client";
import { useRouter } from "next-nprogress-bar";
import BackButton from "../BackButton/BackButton";
import { BackIconOutline } from "../Icons/BackIconOutline";
import { HomeIconOutline } from "../Icons/HomeIconOutline";
import { Button } from "../ui/button";

const ComingSoonDeck = ({ deckName }: { deckName: string | undefined }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col font-sora bg-gray-950 text-white h-full w-full mx-auto pt-14 gap-2 items-between">
      <div className="relative gap-[20px] flex flex-col items-center ">
        <p className="text-[16px] font-semibold text-purple-500">{deckName}</p>
        <p className="text-[14px] font-semibold text-white">Coming Soon</p>
      </div>

      <div className="flex flex-col mt-auto gap-y-[16px] mb-[16px] w-full">
        <Button
          size="lg"
          onClick={() => {
            router.push("/application");
          }}
        >
          Return home
          <HomeIconOutline fill="none" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            router.back();
          }}
        >
          <BackIconOutline fill="none" />
          Back to previous page
        </Button>
        <BackButton />
      </div>
    </div>
  );
};

export default ComingSoonDeck;
