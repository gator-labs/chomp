import { Avatar } from "../Avatar/Avatar";
import PrimarySlider from "../PrimarySlider/PrimarySlider";

type TrueFalseScaleProps = {
  ratioTrue: number;
  handleRatioChange: (percentage: number) => void;
  avatarSrc?: string;
  valueSelected?: number | null | undefined;
  sliderClassName?: string;
  trackClassName?: string;
  labelTrue?: string;
  labelFalse?: string;
  progressColor?: string;
  bgColor?: string;
  hideThumb?: boolean;
};

export function TrueFalseScale({
  ratioTrue,
  handleRatioChange,
  avatarSrc,
  valueSelected,
  sliderClassName,
  trackClassName,
  labelTrue = "True",
  labelFalse = "False",
  progressColor,
  bgColor,
  hideThumb,
}: TrueFalseScaleProps) {
  return (
    <div className="relative h-max flex flex-col gap-2">
      <PrimarySlider
        value={ratioTrue}
        setValue={handleRatioChange}
        progressColor={progressColor}
        backgroundColor={bgColor}
        className={sliderClassName}
        trackClassName={trackClassName}
        hideThumb={hideThumb}
      />
      {valueSelected !== undefined && valueSelected !== null && avatarSrc && (
        <Avatar
          src={avatarSrc}
          size="extrasmall"
          className="absolute top-0.5 z-40"
          style={{
            left: `calc(${valueSelected}% - 0.5rem)`,
          }}
        />
      )}
      <div className="flex justify-between text-white font-sora text-base font-semibold z-30 relative">
        <span>
          {labelTrue} {ratioTrue ?? "0"}%
        </span>
        <span>
          {labelFalse}{" "}
          {ratioTrue === undefined || ratioTrue === null
            ? "0"
            : 100 - ratioTrue}
          %
        </span>
      </div>
    </div>
  );
}
