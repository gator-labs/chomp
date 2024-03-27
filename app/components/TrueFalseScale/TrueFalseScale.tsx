import classNames from "classnames";
import { Avatar } from "../Avatar/Avatar";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { useCallback } from "react";

type TrueFalseScaleProps = {
  ratioTrue: number;
  valueSelected?: number;
  avatarSrc?: string;
  progressBarClassName?: string;
  handleRatioChange?: (percentage: number) => void;
};

const STEP_SIZE = 5;

export function TrueFalseScale({
  ratioTrue,
  valueSelected,
  avatarSrc,
  progressBarClassName,
  handleRatioChange,
}: TrueFalseScaleProps) {
  const avatarLeft = valueSelected
    ? valueSelected > 90
      ? "calc(100% - 16px)"
      : `${valueSelected}%`
    : undefined;

  const handlePercentageChange = useCallback(
    (percentage: number) => {
      const stepUp = ratioTrue + STEP_SIZE;
      const stepDown = ratioTrue - STEP_SIZE;
      const percentageTrue = 100 - percentage;
      let newRatio = ratioTrue;

      if (percentageTrue >= stepUp) {
        newRatio = stepUp;
      }

      if (percentageTrue <= stepDown) {
        newRatio = stepDown;
      }

      if (percentageTrue < 2) {
        newRatio = 0;
      }

      if (percentageTrue > 100) {
        newRatio = 100;
      }

      handleRatioChange && handleRatioChange(newRatio);
    },
    [ratioTrue, handleRatioChange]
  );

  return (
    <div className="relative">
      <ProgressBar
        percentage={100 - ratioTrue}
        progressColor="#8872A5"
        bgColor="#CFC5F7"
        className={classNames("h-[21px]", progressBarClassName)}
        onChange={handlePercentageChange}
      />
      {valueSelected !== undefined && avatarSrc && (
        <Avatar
          src={avatarSrc}
          size="extrasmall"
          className="absolute top-0"
          style={{ left: avatarLeft }}
        />
      )}
      <div className="flex justify-between text-white font-sora text-base font-semibold">
        <span>False {100 - ratioTrue}%</span>
        <span>T {ratioTrue}%</span>
      </div>
    </div>
  );
}
