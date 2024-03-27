"use client";
import { useDragPositionPercentage } from "@/app/hooks/useDragPositionPercentage";
import classNames from "classnames";
import { useCallback, useRef, useState } from "react";

type ProgressBarProps = {
  percentage: number;
  progressColor?: string;
  bgColor?: string;
  className?: string;
  onChange?: (value: number) => void;
};

export function ProgressBar({
  percentage,
  progressColor,
  bgColor,
  className,
  onChange,
}: ProgressBarProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const percentageCapped = percentage > 100 ? 100 : percentage;
  const { handleChangePosition, endDrag, startDrag, isDragging } =
    useDragPositionPercentage({ elementRef: wrapperRef, onChange });

  return (
    <div
      ref={wrapperRef}
      className={classNames(
        "relative rounded-full h-3.5 bg-search-gray w-full overflow-hidden",
        className
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
        onTouchStart={startDrag}
        onTouchEnd={endDrag}
        onMouseLeave={endDrag}
        onMouseMove={handleChangePosition}
        onTouchMove={handleChangePosition}
        style={{ left: `calc(${percentage}% - 20px)` }}
      ></div>
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
