"use client";
import { useDragPositionPercentage } from "@/app/hooks/useDragPositionPercentage";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import classNames from "classnames";
import { useRef, useState } from "react";
import Thumb from "../Thumb/Thumb";

type ProgressBarProps = {
  percentage?: number;
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
  const [percentageCapped, setPercentageCapped] = useState(
    percentage && percentage > 100 ? 100 : (percentage ?? 0),
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { handleChangePosition, endDrag, startDrag, isDragging } =
    useDragPositionPercentage({ elementRef: wrapperRef, onChange });

  useIsomorphicLayoutEffect(() => {
    if (percentage === undefined) {
      setPercentageCapped(100);
    } else {
      setPercentageCapped(
        percentage && percentage > 100 ? 100 : (percentage ?? 0),
      );
    }
  }, [percentage]);

  return (
    <div
      ref={wrapperRef}
      className={classNames(
        "relative rounded-full h-3.5 bg-gray-600 w-full overflow-hidden z-10",
        className,
      )}
      style={{ backgroundColor: bgColor }}
      onClick={(e) => handleChangePosition(e, false)}
      draggable={false}
    >
      <div
        className={classNames("h-full w-10 absolute z-10", {
          "cursor-grab": onChange && !isDragging,
          "cursor-grabbing": onChange && isDragging,
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
        style={{ left: percentage ? `calc(${percentage}% - 20px)` : undefined }}
      >
        {showThumb && (
          <Thumb className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>
      <div
        className={classNames(
          "h-full bg-purple-500 absolute top-0 l-0 w-full",
          {
            "transition-width delay-[2s] duration-[4s] ease-in-out w-0":
              percentage === undefined,
          },
        )}
        style={{
          width: percentageCapped ? `${percentageCapped}%` : 0,
          backgroundColor: progressColor,
        }}
      ></div>
    </div>
  );
}
