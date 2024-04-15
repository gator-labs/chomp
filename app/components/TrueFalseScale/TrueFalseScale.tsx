import { useSteppingChange } from "@/app/hooks/useSteppingChange";
import classNames from "classnames";
import { useState } from "react";
import { Avatar } from "../Avatar/Avatar";
import { ProgressBar } from "../ProgressBar/ProgressBar";

type TrueFalseScaleProps = {
  ratioTrue?: number | null;
  valueSelected?: number | null;
  avatarSrc?: string;
  progressBarClassName?: string;
  handleRatioChange?: (percentage: number) => void;
  labelTrue?: string;
  labelFalse?: string;
};

export function TrueFalseScale({
  ratioTrue,
  valueSelected,
  avatarSrc,
  progressBarClassName,
  handleRatioChange,
  labelTrue = "True",
  labelFalse = "False",
}: TrueFalseScaleProps) {
  const avatarLeft = valueSelected
    ? valueSelected > 90
      ? "calc(100% - 16px)"
      : `${valueSelected}%`
    : undefined;
  const { handlePercentageChange } = useSteppingChange({
    percentage: ratioTrue ?? 0,
    onPercentageChange: handleRatioChange,
  });

  const [isVisibleBackdrop, setIsVisibleBackdrop] = useState(false);

  console.log({ ratioTrue, valueSelected, avatarLeft, avatarSrc });

  return (
    <div className="relative">
      {!!handleRatioChange && isVisibleBackdrop && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-40" />
      )}
      {!!handleRatioChange && isVisibleBackdrop && (
        <div className="absolute px-5 py-4 bg-pink right-0 -top-4 -translate-y-full z-40 rounded-xl flex gap-5">
          <p className="text-[#0d0d0d7d] font-normal">
            F{" "}
            <span className="text-[#0D0D0D] font-semibold">
              {100 - (ratioTrue ?? 0)}%
            </span>
          </p>
          <p className="text-[#0d0d0d7d] font-normal">
            T <span className="text-[#0D0D0D] font-semibold">{ratioTrue}%</span>
          </p>
        </div>
      )}
      <ProgressBar
        percentage={
          ratioTrue === undefined || ratioTrue === null ? 100 : 100 - ratioTrue
        }
        progressColor="#8872A5"
        bgColor="#CFC5F7"
        className={classNames("h-[21px]", progressBarClassName)}
        showThumb={!!handleRatioChange}
        onChange={(percentage) => handlePercentageChange(100 - percentage)}
        onTouchStart={() => setIsVisibleBackdrop(true)}
        onTouchEnd={() => setIsVisibleBackdrop(false)}
      />
      {valueSelected !== undefined && valueSelected !== null && avatarSrc && (
        <Avatar
          src={avatarSrc}
          size="extrasmall"
          className="absolute top-0.5 z-50"
          style={{ left: avatarLeft }}
        />
      )}
      <div className="flex justify-between text-white font-sora text-base font-semibold mt-2 z-40 relative">
        <span>
          {labelFalse}{" "}
          {ratioTrue === undefined || ratioTrue === null
            ? "0"
            : 100 - ratioTrue}
          %
        </span>
        <span>
          {labelTrue} {ratioTrue ?? "0"}%
        </span>
      </div>
    </div>
  );
}
