import { useRef } from "react";
import { ViewsIcon } from "../Icons/ViewsIcon";
import { useDragPositionPercentage } from "@/app/hooks/useDragPositionPercentage";
import classNames from "classnames";

type AnswerResultProps = {
  percentage: number;
  handleRatioChange?: (percentage: number) => void;
  answerText: string;
};

export function AnswerResult({
  percentage,
  answerText,
  handleRatioChange,
}: AnswerResultProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const percentageCapped = percentage > 100 ? 100 : percentage;
  const { handleChangePosition, endDrag, startDrag, isDragging } =
    useDragPositionPercentage({
      elementRef: wrapperRef,
      onChange: handleRatioChange,
    });
  return (
    <div className="flex items-center gap-1">
      <div
        ref={wrapperRef}
        onClick={(e) => handleChangePosition(e, false)}
        className={
          "relative rounded-[4px] h-6 bg-search-gray w-full overflow-hidden"
        }
      >
        <div
          className={classNames("h-full w-10 cursor-grab absolute z-10", {
            "cursor-grabbing": isDragging,
          })}
          onMouseDown={startDrag}
          onMouseUp={endDrag}
          onTouchStart={startDrag}
          onTouchEnd={endDrag}
          onMouseLeave={endDrag}
          onMouseMove={handleChangePosition}
          onTouchMove={handleChangePosition}
          style={{ left: `calc(${percentageCapped}% - 20px)` }}
        ></div>
        <div
          className="h-full bg-purple absolute top-0 l-0 w-full"
          style={{
            width: `${percentageCapped}%`,
          }}
        ></div>
        <div className="absolute left-4 top-0 flex items-center py-1 gap-2">
          <ViewsIcon width={14} height={14} fill="#1B1B1B" />
          <span className="text-black text-sm font-sora">{answerText}</span>
        </div>
      </div>
      <div className="text-white text-sm min-w-6">{percentage}%</div>
    </div>
  );
}
