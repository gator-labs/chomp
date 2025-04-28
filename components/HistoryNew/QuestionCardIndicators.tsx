import { InfoIcon } from "@/app/components/Icons/InfoIcon";

import { QuestionCardIndicator } from "./QuestionCardIndicator";

type QuestionCardIndicatorsProps = {
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  unrevealedCount: number;
  unseenCount: number;
  incompleteCount: number;
  onInfoClick?: () => void;
};

export function QuestionCardIndicators({
  correctCount,
  incorrectCount,
  unansweredCount,
  unrevealedCount,
  unseenCount,
  incompleteCount,
  onInfoClick,
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
          count={unansweredCount + unseenCount + incompleteCount}
          indicatorType="unanswered"
        />
        <QuestionCardIndicator
          count={unrevealedCount}
          indicatorType="unrevealed"
        />
      </div>
      <span className="cursor-pointer" onClick={onInfoClick}>
        <InfoIcon />
      </span>
    </div>
  );
}
