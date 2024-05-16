import PrimarySlider from "../PrimarySlider/PrimarySlider";

type TrueFalseScaleProps = {
  ratioLeft: number;
  handleRatioChange: (percentage: number) => void;
  sliderClassName?: string;
  trackClassName?: string;
  labelLeft?: string;
  labelRight?: string;
  progressColor?: string;
  bgColor?: string;
  hideThumb?: boolean;
};

export function TrueFalseScale({
  ratioLeft,
  handleRatioChange,
  sliderClassName,
  trackClassName,
  labelLeft = "True",
  labelRight = "False",
  progressColor,
  bgColor,
  hideThumb,
}: TrueFalseScaleProps) {
  return (
    <div className="relative h-max flex flex-col gap-2">
      <PrimarySlider
        value={ratioLeft}
        setValue={handleRatioChange}
        progressColor={progressColor}
        backgroundColor={bgColor}
        className={sliderClassName}
        trackClassName={trackClassName}
        hideThumb={hideThumb}
      />

      <div className="flex justify-between text-white font-sora text-base font-semibold z-30 relative">
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
