import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import QrCode from "@/public/images/qr-code.png";
import { QuestionType } from "@prisma/client";
import Image from "next/image";

import BinaryChoiceResultLayout from "../BinaryChoiceResultLayout/BinaryChoiceResultLayout";
import MultiChoiceResultLayout from "../MultiChoiceResultLayout/MultiChoiceResultLayout";

type SingleClaimPreviewImageProps = {
  options: Array<{ id: number; option: string }>;
  selectedOptionId: number;
  claimedAmount: number;
  question: string;
  imageUrl?: string;
};

const SingleClaimPreviewImage = ({
  options,
  selectedOptionId,
  claimedAmount,
  question,
  imageUrl,
}: SingleClaimPreviewImageProps) => {
  const questionType =
    options.length === 2
      ? QuestionType.BinaryQuestion
      : QuestionType.MultiChoice;

  return (
    <div className="bg-[#F3F2EC] p-3 rounded mb-6 flex gap-2">
      <div className="flex flex-col gap-2 flex-[1.4]">
        <div className="px-1 py-2 bg-primary rounded flex gap-2 items-center justify-start">
          <Image
            src={AvatarPlaceholder.src}
            width={26}
            height={26}
            alt="profile"
            className="rounded-full border-[2px] border-purple-100 flex-shrink-0"
          />

          <div className="font-black text-[12px] leading-[16px] tracking-tighter text-secondary text-nowrap">
            <p>I just won</p>
            <p>
              <span className="text-white">
                {Math.round(claimedAmount).toLocaleString("en-US")} BONK
              </span>{" "}
              from Chomp
            </p>
          </div>
        </div>

        {questionType === QuestionType.MultiChoice && (
          <MultiChoiceResultLayout
            options={options}
            question={question}
            selectedOptionId={selectedOptionId}
          />
        )}

        {questionType === QuestionType.BinaryQuestion && (
          <BinaryChoiceResultLayout
            options={options}
            question={question}
            selectedOptionId={selectedOptionId}
            imageUrl={imageUrl}
          />
        )}

        <div className="px-1 py-2 bg-primary rounded">
          <p className="tracking-tight text-purple-100 font-bold text-[12px] leading-[15px]">
            Join the party and win BONK at{" "}
            <span className="text-white">app.chomp.games</span>{" "}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-5  flex-[1]">
        <p className="font-black text-[15.54px] leading-[17.56px] text-gray-900 tracking-tight">
          Know the answer? Prove it, and win. Keep proving it, and win forever
          😉
        </p>
        <div className="relative flex-1 border-[2.73px] border-primary rounded-[16px] overflow-hidden">
          <Image src={QrCode.src} fill alt="qr-code" />
        </div>
      </div>
    </div>
  );
};

export default SingleClaimPreviewImage;
