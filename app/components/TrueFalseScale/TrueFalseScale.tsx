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
    <div className="relative h-max flex flex-col gap-4">
      <PrimarySlider
        value={ratioLeft}
        setValue={handleRatioChange}
        progressColor={progressColor}
        backgroundColor={bgColor}
        className={sliderClassName}
        trackClassName={trackClassName}
        hideThumb={hideThumb}
      />

      <div className="flex justify-between text-white font-sora text-base font-semibold z-30 relative items-center">
        <span className="text-sm pl-2">{labelLeft}</span>
        <span className="absolute left-1/2 -translate-x-1/2 bg-white py-1 px-2 rounded-2xl text-[#0D0D0D] text-xs font-bold">
          {ratioLeft}%
        </span>
        <span className="text-sm pr-2">{labelRight}</span>
      </div>
    </div>
  );
}
