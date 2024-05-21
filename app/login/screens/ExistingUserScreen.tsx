import { Button } from "@/app/components/Button/Button";
import ChompHeadIcon from "@/app/components/Icons/ChompHeadIcon";
import { HalfArrowRightIcon } from "@/app/components/Icons/HalfArrowRightIcon";
import Link from "next/link";

const ExistingUserScreen = () => {
  return (
    <main className="flex flex-col gap-3 px-4 justify-between h-dvh bg-[#1B1B1B]">
      <div className="relative w-full flex [&>*]:w-full">
        <ChompHeadIcon />
      </div>
      <div className="flex flex-col gap-8 items-center text-[20px] leading-6">
        <h3 className="text-center">Welcome back!</h3>

        <div className="flex gap-[10px] items-center">
          <div>
            <p className="text-sm text-center">
              Good to see you again. Click below to head over to your Daily Deck
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[14px] items-center w-full py-4">
        <Link href="/application" className="w-full">
          <Button variant="purple" className="gap-1">
            Start Daily Deck <HalfArrowRightIcon fill="#0D0D0D" />
          </Button>
        </Link>
      </div>
    </main>
  );
};

export default ExistingUserScreen;
