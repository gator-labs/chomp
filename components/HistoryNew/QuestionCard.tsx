import { ChevronRightIcon } from "@/app/components/Icons/ChevronRightIcon";
import { QuestionCardIndicatorType } from "@/types/question";
import Link from "next/link";
import { forwardRef } from "react";

import { QuestionCardStatus } from "./QuestionCardStatus";

type QuestionCardProps = {
  title: string;
  deckTitle: string;
  questionId: number;
  indicatorType: QuestionCardIndicatorType;
};

const QuestionCard = forwardRef<HTMLDivElement, QuestionCardProps>(
  function QuestionCard(
    { title, deckTitle, questionId, indicatorType }: QuestionCardProps,
    ref,
  ) {
    return (
      <div className="bg-gray-700 rounded-lg p-3 gap-6 flex flex-col" ref={ref}>
        <div className="text-sm font-medium">{title}</div>

        <div className="flex justify-between">
          <QuestionCardStatus title={deckTitle} indicatorType={indicatorType} />
          {indicatorType != "unrevealed" && (
            <Link
              href={`/application/answer/reveal/${questionId}`}
              className="flex items-center"
            >
              <div className="flex items-center justify text-xs text-gray-400 gap-1">
                <span>View Answer</span> <ChevronRightIcon />
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  },
);

export { QuestionCard };
