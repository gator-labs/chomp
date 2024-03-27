import classNames from "classnames";
import { Avatar } from "../Avatar/Avatar";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { useSteppingChange } from "@/app/hooks/useSteppingChange";

type TrueFalseScaleProps = {
  ratioTrue: number;
  valueSelected?: number;
  avatarSrc?: string;
  progressBarClassName?: string;
  handleRatioChange?: (percentage: number) => void;
};

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
  const { handlePercentageChange } = useSteppingChange({
    percentage: ratioTrue,
    onPercentageChange: handleRatioChange,
  });

  return (
    <div className="relative">
      <ProgressBar
        percentage={100 - ratioTrue}
        progressColor="#8872A5"
        bgColor="#CFC5F7"
        className={classNames("h-[21px]", progressBarClassName)}
        onChange={(percentage) => handlePercentageChange(100 - percentage)}
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
