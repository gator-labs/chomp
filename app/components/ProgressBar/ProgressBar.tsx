"use client";
import { useDragPositionPercentage } from "@/app/hooks/useDragPositionPercentage";
import classNames from "classnames";
import { useRef } from "react";
import Thumb from "../Thumb/Thumb";

type ProgressBarProps = {
  percentage: number;
  progressColor?: string;
  bgColor?: string;
  className?: string;
  showThumb?: boolean;
  onChange?: (value: number) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
};

export function ProgressBar({
  percentage,
  progressColor,
  bgColor,
  className,
  showThumb,
  onChange,
  onTouchStart,
  onTouchEnd,
}: ProgressBarProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const percentageCapped = percentage > 100 ? 100 : percentage;
  const { handleChangePosition, endDrag, startDrag, isDragging } =
    useDragPositionPercentage({ elementRef: wrapperRef, onChange });

  return (
    <div
      ref={wrapperRef}
      className={classNames(
        "relative rounded-full h-3.5 bg-search-gray w-full overflow-hidden z-50",
        className,
      )}
      style={{ backgroundColor: bgColor }}
      onClick={(e) => handleChangePosition(e, false)}
      draggable={false}
    >
      <div
        className={classNames("h-full w-10 cursor-grab absolute z-10", {
          "cursor-grabbing": isDragging,
        })}
        onMouseDown={startDrag}
        onMouseUp={endDrag}
        onTouchStart={() => {
          onTouchStart?.();
          startDrag();
        }}
        onTouchEnd={() => {
          onTouchEnd?.();
          endDrag();
        }}
        onMouseLeave={endDrag}
        onMouseMove={handleChangePosition}
        onTouchMove={handleChangePosition}
        style={{ left: `calc(${percentage}% - 20px)` }}
      >
        {showThumb && (
          <Thumb className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
      <div
        className="h-full bg-purple absolute top-0 l-0 w-full"
        style={{
          width: `${percentageCapped}%`,
          backgroundColor: progressColor,
        }}
      ></div>
    </div>
  );
}
