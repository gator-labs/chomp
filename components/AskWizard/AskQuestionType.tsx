import { cn } from "@/lib/utils";
import bgEllipse2 from "@/public/images/bg_ellipse2.svg";
import bgEllipse from "@/public/images/bg_ellipse.svg";
import { QuestionType } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export type AskQuestionTypeProps = {
  type: QuestionType;
  points: number;
  onClick: () => void;
};

export function AskQuestionType({
  type,
  points,
  onClick,
}: AskQuestionTypeProps) {
  return (
    <div
      className="bg-purple-500 rounded-xl h-1/2 flex flex-col cursor-pointer relative overflow-hidden min-h-[16em]"
      onClick={() => onClick?.()}
    >
      <Image
        src={type == QuestionType.MultiChoice ? bgEllipse : bgEllipse2}
        alt="ellipse"
        className={cn("absolute z-10", {
          "top-[0px] left-[0px] w-[70%] h-[70%]":
            type === QuestionType.MultiChoice,
          "bottom-[0px] right-[0px] w-[70%] h-[70%]":
            type === QuestionType.BinaryQuestion,
        })}
      />
      <div className="px-4 py-6 h-full flex flex-col gap-1">
        <div className="text-base font-medium">Ask a question with</div>
        <div className="text-4xl font-black">
          {type == QuestionType.BinaryQuestion ? "2" : "4"} choices
        </div>
      </div>
      {points > 0 && (
        <div className="mx-4 my-5">
          <span className="bg-black rounded-full p-3 text-xs font-bold">
            {points}+ Points per published question
          </span>
        </div>
      )}
      <div className="bg-green text-black rounded-b-xl py-2 px-2 font-bold flex justify-between items-center">
        <span className="px-2">Ask Now</span>
        <span className="bg-black text-white rounded-full p-1">
          <ArrowRight size={28} />
        </span>
      </div>
    </div>
  );
}
