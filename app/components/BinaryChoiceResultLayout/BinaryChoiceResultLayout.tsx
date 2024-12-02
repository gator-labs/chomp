import { cn } from "@/lib/utils";
import Image from "next/image";

import gatorHeadImage from "../../../public/images/gator-head.png";

type BinaryChoiceResultLayoutProps = {
  options: Array<{ id: number; option: string }>;
  question: string;
  selectedOptionId: number;
  imageUrl?: string;
};

const BinaryChoiceResultLayout = ({
  question,
  options,
  selectedOptionId,
  imageUrl,
}: BinaryChoiceResultLayoutProps) => {
  return (
    <div className="px-1 py-2 bg-purple-100 rounded">
      <div className="bg-gray-700 py-[6px] px-[10px] rounded-[5px] flex flex-col gap-[6px] relative mb-1 min-h-[50px]">
        <p className="font-bold text-[8px] leading-[8px]">{question}</p>
        {!!imageUrl && (
          <div className="flex justify-end">
            <Image
              src={imageUrl}
              width={32}
              height={32}
              alt="head"
              className="w-8 h-8 object-cover"
            />
          </div>
        )}
        <Image
          src={gatorHeadImage.src}
          width={120}
          height={46}
          alt="head"
          className="absolute bottom-0 left-0"
        />
      </div>
      <p className="text-[8px] leading-[10px] text-gray-900 text-center font-bold mb-1">
        Do you agree with this statement?
      </p>

      <ul className="flex gap-1">
        {options.map((option) => (
          <li
            key={option.id}
            className={cn(
              "text-[8px] leading-[10px] text-gray-900 text-center font-bold flex flex-1 justify-center items-center p-1 rounded-[4px] bg-[#A3A3EC]",
              {
                "bg-purple-400 text-white": selectedOptionId === option.id,
              },
            )}
          >
            {option.option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BinaryChoiceResultLayout;
