import { cn } from "@/lib/utils";
import Image from "next/image";

import gatorHeadImage from "../../../public/images/gator-head.png";
import { OPTION_LABEL } from "../AnswerResult/constants";

type MultiChoiceResultLayoutProps = {
  options: Array<{ id: number; option: string }>;
  selectedOptionId: number;
  question: string;
};

const MultiChoiceResultLayout = ({
  question,
  options,
  selectedOptionId,
}: MultiChoiceResultLayoutProps) => {
  return (
    <div className="px-1 py-2 bg-purple-100 rounded">
      <div className="bg-gray-700 py-[6px] px-[10px] rounded-[5px] flex flex-col gap-[6px] relative">
        <p className="font-bold text-[8px] leading-[8px]">{question}</p>
        <ul className="flex flex-col gap-[6px]">
          {options.map((option, index) => (
            <li
              key={option.id}
              className="flex text-[4.6px] leading-[6.22px] gap-2"
            >
              <div
                className={cn(
                  "w-5 bg-gray-600 text-white flex justify-center items-center rounded-[2.3px] py-[3.6px]",
                  {
                    "bg-primary": selectedOptionId === option.id,
                  },
                )}
              >
                {OPTION_LABEL[index as keyof typeof OPTION_LABEL]}
              </div>
              <div className="border-[0.58px] border-gray-500 bg-gray-700 rounded-[2.3px] flex-1 items-center flex pl-[9px]">
                <p>{option.option}</p>
              </div>
            </li>
          ))}
        </ul>
        <Image
          src={gatorHeadImage.src}
          width={120}
          height={46}
          alt="head"
          className="absolute bottom-0 right-5"
        />
      </div>
    </div>
  );
};

export default MultiChoiceResultLayout;
