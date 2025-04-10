import { getAlphaIdentifier } from "@/app/utils/question";
import gatorHeadImage from "@/public/images/gator-head.png";
import Image from "next/image";

import { AskImagePreview } from "./AskImagePreview";

export type AskQuestionPreviewProps = {
  title: string;
  options: string[];
  imageUrl?: string | null;
};

export type OptionProps = {
  option: string;
  index: number;
};

function MultiChoiceOption({ option, index }: OptionProps) {
  return (
    <div className="flex gap-2">
      <div className="bg-gray-600 text-base font-bold rounded-lg flex gap-2 items-center aspect-square justify-center p-2">
        {getAlphaIdentifier(index)}
      </div>
      <div className="border border-gray-500 rounded-lg text-sm font-medium align-middle w-full p-4 truncate">
        {option}
      </div>
    </div>
  );
}

function BinaryOption({ option }: OptionProps) {
  return (
    <div className="flex gap-2">
      <div className="bg-purple-500 rounded-lg text-base font-black align-middle w-full p-4 truncate">
        {option}
      </div>
    </div>
  );
}

export function AskQuestionPreview({
  title,
  options,
  imageUrl,
}: AskQuestionPreviewProps) {
  const isBinary = options.length == 2;

  return (
    <div className="flex flex-col gap-2">
      <div className="block mb-1 text-base font-medium">Preview</div>
      <div className="bg-purple-500 rounded-xl flex flex-col py-3 px-5 relative overflow-hidden">
        <Image
          src={gatorHeadImage}
          alt="gator-head"
          className="absolute bottom-0 w-[241px] h-[93px] z-10"
        />
        <div className="font-bold text-xl py-2 wrap overflow-hidden">
          {title}
        </div>
        <div className="flex justify-end">
          <AskImagePreview imageUrl={imageUrl} />
        </div>
      </div>
      <div className="bg-gray-700 rounded-xl py-4 px-6 gap-2 flex flex-col">
        <div className="block mb-1 text-base font-medium">Choices:</div>
        <div className="flex flex-col gap-2">
          {options.map((option, index) =>
            isBinary ? (
              <BinaryOption option={option} index={index} key={index} />
            ) : (
              <MultiChoiceOption option={option} index={index} key={index} />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
