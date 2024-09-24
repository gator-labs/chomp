import { cn } from "@/lib/utils";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import qrCodeImage from "@/public/images/qr-code.png";
import { QuestionOption } from "@prisma/client";
import Image from "next/image";
import { Button } from "../ui/button";

const OPTION = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
};

const BINARY_OPTIONS = ["No", "Yes"];

type SingleRevealShareImageProps = {
  options: QuestionOption[];
  question: string;
  selectedOptionId: number;
  profileSrc?: string | null;
  rewardAmount: string;
};

const SingleRevealShareImage = ({
  options,
  question,
  selectedOptionId,
  profileSrc,
  rewardAmount,
}: SingleRevealShareImageProps) => {
  const multipleQuestionContent = (
    <div className="bg-gray-700 p-2 w-full flex flex-col gap-2 rounded-[4px] tracking-tight">
      <p className="font-bold text-white text-[10px] leading-3">{question}</p>
      <ul className="flex flex-col gap-2">
        {options.map((option, index) => (
          <li key={index} className="flex gap-2">
            <div
              className={cn(
                "w-6 h-3 bg-gray-600 flex justify-center items-center rounded-[4px]",
                {
                  "bg-purple-500": selectedOptionId === option.id,
                },
              )}
            >
              <p className="text-[4px] leading-[6px]">
                {OPTION[index as keyof typeof OPTION]}
              </p>
            </div>
            <div className="border-[0.57px] border-solid border-gray-500 flex-1 h-3 flex items-center pl-2 rounded-[2px]">
              <p className="text-[4px] leading-[6px] tracking-normal">
                {option.option}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const binaryQuestionContent = (
    <>
      <div className="bg-gray-700 p-2 w-full flex flex-col gap-2 rounded-[4px] tracking-tight min-h-[80px]">
        <p className="font-bold text-white text-[10px] leading-3">{question}</p>
      </div>
      <p className="text-[10px] leading-[10px] text-gray-900 text-center my-1.5">
        Do you agree with this statement?
      </p>
      <ul className="flex gap-1">
        {options.map((option) => (
          <Button
            className={cn(
              "text-[8px] leading-[8px] h-4 flex-1 bg-[#A3A3EC] text-gray-950 border-none rounded-[2px] tracking-normal",
              {
                "text-white bg-purple-400": selectedOptionId === option.id,
              },
            )}
          >
            {option.option}
          </Button>
        ))}
      </ul>
    </>
  );

  return (
    <div className="p-3 bg-white w-full flex rounded-[8px] gap-2">
      <div className="flex flex-col flex-[1.7] gap-2">
        <div className="rounded-[4px] p-1 bg-purple-500 gap-1 flex items-center">
          <Image
            src={profileSrc || AvatarPlaceholder.src}
            width={24}
            height={24}
            alt="pfp"
            className="rounded-full flex-shrink-0 w-6 h-6"
          />
          <div className="flex flex-col">
            <p className="text-xs font-black text-purple-200">I just won</p>
            <p className="text-xs font-black text-purple-200">
              <span className="text-white">{rewardAmount} BONK</span> from Chomp
            </p>
          </div>
        </div>
        <div className="p-2 rounded-[4px] bg-purple-100 flex-1">
          {options.length > 2 ? multipleQuestionContent : binaryQuestionContent}
        </div>
        <div className="rounded-[4px] p-1 bg-purple-500 gap-1 flex items-center">
          <p className="text-xs font-black text-purple-200">
            Join the party and win BONK at{" "}
            <span className="text-white">app.chomp.games</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-3">
        <p className="text-black font-bold text-[15px] leading-[18px] tracking-tight">
          Know the answer? Prove it, and win.Keep proving it, and win forever 😉
        </p>
        <div className="p-2 rounded-[8px] border-[1.57px] border-purple-500 aspect-square mt-auto">
          <div className="relative h-full">
            <Image src={qrCodeImage.src} fill alt="qr-code" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleRevealShareImage;
