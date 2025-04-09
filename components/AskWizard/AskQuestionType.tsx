import { QuestionType } from "@prisma/client";
import { ArrowRight } from "lucide-react";

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
      className="bg-purple-500 rounded-xl h-1/2 flex flex-col cursor-pointer"
      onClick={() => onClick?.()}
    >
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
