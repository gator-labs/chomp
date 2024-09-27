import ChompHeadIcon from "@/app/components/Icons/ChompHeadIcon";
import { HalfArrowRightIcon } from "@/app/components/Icons/HalfArrowRightIcon";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

interface Props {
  hasDailyDeck: boolean;
}

const ExistingUserScreen = ({ hasDailyDeck }: Props) => {
  return (
    <main className="h-dvh bg-gray-800 pt-16">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-4 justify-between h-full">
        <div className="relative w-full flex [&>*]:w-full">
          <ChompHeadIcon />
        </div>
        <div className="flex flex-col gap-8 items-center text-xl leading-6">
          <h3 className="text-center">Welcome back!</h3>

          <div className="flex gap-[10px] items-center w-full justify-center">
            <p className="text-sm text-center">
              Good to see you again. Click below to head over to{" "}
              {hasDailyDeck ? "your Daily Deck." : "app."}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-[14px] items-center w-full py-4">
          <Link
            href={hasDailyDeck ? "daily-deck" : "/application"}
            className="w-full"
          >
            <Button>
              {hasDailyDeck ? "Start Daily Deck" : "Start"}{" "}
              <HalfArrowRightIcon fill="#FFFFFF" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ExistingUserScreen;
