import { Button } from "@/app/components/Button/Button";
import { HalfArrowRightIcon } from "@/app/components/Icons/HalfArrowRightIcon";
import NewIcon from "@/app/components/Icons/NewIcon";
import Link from "next/link";

const NewUserScreen = () => {
  return (
    <main className="h-dvh bg-[#1B1B1B] pt-16">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-4 justify-between h-full">
        <div className="relative w-full flex [&>*]:w-full">
          <NewIcon />
        </div>
        <div className="flex flex-col gap-8 items-center text-[20px] leading-6">
          <h3 className="text-center">First time?</h3>

          <div className="flex gap-[10px] items-center w-full justify-center">
            <p className="text-sm text-center">
              New to Chomp? Why not take 30 seconds to learn how everything works?
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-[14px] items-center w-full py-4">
          <Link href="/tutorial" className="w-full">
            <Button variant="purple" className="gap-1">
              Let’s go <HalfArrowRightIcon fill="#0D0D0D" />
            </Button>
          </Link>
          <Link href="/application">
            <p className="text-sm text-[#666666] underline">Skip tutorial</p>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NewUserScreen;
