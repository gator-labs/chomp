import classNames from "classnames";
import { Avatar } from "../Avatar/Avatar";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { useSteppingChange } from "@/app/hooks/useSteppingChange";

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
  labelTrue = "T",
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

  return (
    <div className="relative">
      <ProgressBar
        percentage={
          ratioTrue === undefined || ratioTrue === null ? 100 : 100 - ratioTrue
        }
        progressColor="#8872A5"
        bgColor="#CFC5F7"
        className={classNames("h-[21px]", progressBarClassName)}
        onChange={(percentage) => handlePercentageChange(100 - percentage)}
      />
      {valueSelected !== undefined && valueSelected !== null && avatarSrc && (
        <Avatar
          src={avatarSrc}
          size="extrasmall"
          className="absolute top-0.5"
          style={{ left: avatarLeft }}
        />
      )}
      <div className="flex justify-between text-white font-sora text-base font-semibold mt-2">
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
