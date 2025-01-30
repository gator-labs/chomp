import { InfoIcon } from "@/app/components/Icons/InfoIcon";

import { QuestionCardIndicator } from "./QuestionCardIndicator";

type QuestionCardIndicatorsProps = {
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  unrevealedCount: number;
};

export function QuestionCardIndicators({
  correctCount,
  incorrectCount,
  unansweredCount,
  unrevealedCount,
}: QuestionCardIndicatorsProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex text-xs font-medium gap-1">
        <QuestionCardIndicator count={correctCount} indicatorType="correct" />
        <QuestionCardIndicator
          count={incorrectCount}
          indicatorType="incorrect"
        />
        <QuestionCardIndicator
          count={unansweredCount}
          indicatorType="unanswered"
        />
        <QuestionCardIndicator
          count={unrevealedCount}
          indicatorType="unrevealed"
        />
      </div>
      <InfoIcon />
    </div>
  );
}
