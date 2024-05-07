import { useSteppingChange } from "@/app/hooks/useSteppingChange";
import classNames from "classnames";
import { useState } from "react";
import { Avatar } from "../Avatar/Avatar";
import { ProgressBar } from "../ProgressBar/ProgressBar";

type TrueFalseScaleProps = {
  ratioLeft?: number | null;
  valueSelected?: number | null;
  avatarSrc?: string;
  progressBarClassName?: string;
  handleRatioChange?: (percentage: number) => void;
  labelLeft: string;
  labelRight: string;
  progressColor?: string;
  bgColor?: string;
};

export function TrueFalseScale({
  ratioLeft,
  valueSelected,
  avatarSrc,
  progressBarClassName,
  handleRatioChange,
  labelLeft,
  labelRight,
  progressColor = "#8872A5",
  bgColor = "#CFC5F7",
}: TrueFalseScaleProps) {
  const avatarLeft = valueSelected
    ? valueSelected > 90
      ? "calc(100% - 16px)"
      : `${valueSelected}%`
    : undefined;
  const { handlePercentageChange } = useSteppingChange({
    percentage: ratioLeft ?? 0,
    onPercentageChange: handleRatioChange,
  });

  const [isVisibleBackdrop, setIsVisibleBackdrop] = useState(false);

  return (
    <div className="relative">
      {!!handleRatioChange && isVisibleBackdrop && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999]" />
      )}
      {!!handleRatioChange && isVisibleBackdrop && (
        <div className="absolute px-5 py-4 bg-pink right-0 -top-4 -translate-y-full z-[9999] rounded-xl flex gap-5">
          <p className="text-[#0d0d0d7d] font-normal">
            {labelLeft}{" "}
            <span className="text-[#0D0D0D] font-semibold">{ratioLeft}%</span>
          </p>
          <p className="text-[#0d0d0d7d] font-normal">
            {labelRight}{" "}
            <span className="text-[#0D0D0D] font-semibold">
              {100 - (ratioLeft ?? 0)}%
            </span>
          </p>
        </div>
      )}
      <ProgressBar
        percentage={
          ratioLeft === undefined || ratioLeft === null ? 100 : ratioLeft
        }
        progressColor={progressColor}
        bgColor={bgColor}
        className={classNames("h-[21px] z-30", progressBarClassName)}
        showThumb={!!handleRatioChange}
        onChange={(percentage) => handlePercentageChange(percentage)}
        onTouchStart={() => setIsVisibleBackdrop(true)}
        onTouchEnd={() => setIsVisibleBackdrop(false)}
      />
      {valueSelected !== undefined && valueSelected !== null && avatarSrc && (
        <Avatar
          src={avatarSrc}
          size="extrasmall"
          className="absolute top-0.5 z-40"
          style={{ left: avatarLeft }}
        />
      )}
      <div className="flex justify-between text-white font-sora text-base font-semibold mt-2 z-30 relative">
        <span>
          {labelLeft} {ratioLeft ?? "0"}%
        </span>
        <span>
          {labelRight}{" "}
          {ratioLeft === undefined || ratioLeft === null
            ? "0"
            : 100 - ratioLeft}
          %
        </span>
      </div>
    </div>
  );
}
