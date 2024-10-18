import { ChompFlatIcon } from "@/app/components/Icons/ChompFlatIcon";
import { Button } from "@/app/components/ui/button";
import { TRACKING_EVENTS } from "@/app/constants/tracking";
import trackEvent from "@/lib/trackEvent";
import { ANSWER_PATH, HISTORY_PATH } from "@/lib/urls";
import chompyImg from "@/public/images/chompy.png";

import Image from "next/image";
import Link from "next/link";

const ExistingUserScreen = () => {
  return (
    <main className="h-dvh bg-gray-900 max-w-4xl mx-auto ">
      <div className="py-4 flex justify-center items-center">
        <ChompFlatIcon width={37} height={14} fill="#fff" />
      </div>
      <div className="py-28 px-4 flex flex-col gap-9">
        <Image
          src={chompyImg.src}
          width={152}
          height={140}
          alt="chomp"
          className="mx-auto"
          sizes="(max-width: 768px) 100vw, 152px"
        />
        <div className="flex flex-col gap-2 justify-center items-center">
          <p className="text-2xl text-white font-bold leading-[27.6px]">
            Welcome back!
          </p>
          <p className="text-sm text-gray-400 leading-[18.9px] font-medium">
            What do you want to do today?
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() =>
              trackEvent(TRACKING_EVENTS.WELCOME_BACK_ANSWER_BUTTON_CLICKED)
            }
            asChild
          >
            <Link href={ANSWER_PATH}>Answer Questions</Link>
          </Button>
          <Button
            onClick={() =>
              trackEvent(TRACKING_EVENTS.WELCOME_BACK_REVEAL_BUTTON_CLICKED)
            }
            variant="outline"
            asChild
          >
            <Link href={HISTORY_PATH}>Reveal Answers</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ExistingUserScreen;
