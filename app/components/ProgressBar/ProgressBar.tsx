"use client";
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
  const [isDragging, setIsDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const percentageCapped = percentage > 100 ? 100 : percentage;
  const handleChangePosition = useCallback(
    (
      event:
        | React.MouseEvent<HTMLDivElement>
        | React.TouchEvent<HTMLDivElement>,
      isDrag = true
    ) => {
      if (!isDragging && isDrag) return;
      const rect = wrapperRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 0;
      const left = rect?.left ?? 0;
      const clientX =
        (event as React.MouseEvent)?.clientX ??
        (event as React.TouchEvent).touches[0].clientX;
      const percentage = (clientX - left) / width;
      onChange && onChange(Math.round(percentage * 100));
    },
    [isDragging, onChange]
  );

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
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
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
