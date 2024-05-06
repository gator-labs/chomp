import PrimarySlider from "../PrimarySlider/PrimarySlider";

type TrueFalseScaleProps = {
  ratioTrue: number;
  handleRatioChange: (percentage: number) => void;
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
