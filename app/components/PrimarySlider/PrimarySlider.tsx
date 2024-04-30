"use client";
import * as Slider from "@radix-ui/react-slider";

interface PrimarySliderProps {
  value: number;
  setValue?: (value: number) => void;
  backgroundColor?: string;
  progressColor?: string;
  hideThumb?: boolean;
  className?: string;
}

const PrimarySlider = ({
  value,
  setValue,
  backgroundColor,
  progressColor,
  hideThumb = false,
  className,
}: PrimarySliderProps) => {
  return (
    <Slider.Root
      className={`relative flex items-center select-none touch-none w-full min-h-5 ${className}`}
      defaultValue={[50]}
      max={100}
      step={1}
      onValueChange={(value) => setValue && setValue(Number(value))}
      value={[value]}
    >
      <Slider.Track
        className={`relative grow rounded-[10px] h-[36px] overflow-hidden ${backgroundColor ? backgroundColor : "bg-pink"}`}
      >
        <Slider.Range
          className={`absolute rounded-l-lg h-[36px] ${progressColor ? progressColor : "bg-dark-purple"}`}
        />
      </Slider.Track>
      {!hideThumb && (
        <Slider.Thumb
          className="block w-5 h-5 bg-white rounded-md focus:outline-none px-[2px] cursor-pointer"
          aria-label="Volume"
        >
          <div className="flex justify-around w-full h-full items-center">
            <div className="w-[2px] h-1/3 bg-gray " />
            <div className="w-[2px] h-1/3 bg-gray " />
          </div>
        </Slider.Thumb>
      )}
    </Slider.Root>
  );
};

export default PrimarySlider;
