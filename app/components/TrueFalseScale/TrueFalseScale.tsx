import PrimarySlider from "../PrimarySlider/PrimarySlider";

type TrueFalseScaleProps = {
  ratioTrue: number;
  handleRatioChange: (percentage: number) => void;
  avatarSrc?: string;
  sliderClassName?: string;
  labelTrue?: string;
  labelFalse?: string;
  progressColor?: string;
  bgColor?: string;
};

export function TrueFalseScale({
  ratioTrue,
  handleRatioChange,
  avatarSrc,
  sliderClassName,
  labelTrue = "True",
  labelFalse = "False",
  progressColor,
  bgColor,
}: TrueFalseScaleProps) {
  return (
    <div className="relative h-max flex flex-col gap-2">
      <PrimarySlider
        value={ratioTrue}
        setValue={handleRatioChange}
        progressColor={progressColor}
        backgroundColor={bgColor}
        className={sliderClassName}
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
