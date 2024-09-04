// This slider component refers to old design of slider component shown in the figma design.

"use client";
import * as Slider from "@radix-ui/react-slider";
import classNames from "classnames";

interface PrimarySliderProps {
  value: number;
  setValue?: (value: number) => void;
  backgroundColor?: string;
  progressColor?: string;
  hideThumb?: boolean;
  className?: string;
  trackClassName?: string;
  rangeClassName?: string;
}

const PrimarySlider = ({
  value,
  setValue,
  backgroundColor,
  progressColor,
  hideThumb = false,
  className,
  trackClassName,
  rangeClassName,
}: PrimarySliderProps) => {
  return (
    <Slider.Root
      className={classNames(
        "relative flex items-center select-none touch-none w-full min-h-5",
        className,
      )}
      defaultValue={[50]}
      max={100}
      step={1}
      onValueChange={(value) => setValue && setValue(Number(value))}
      value={[value]}
    >
      <Slider.Track
        className={classNames(
          "relative grow rounded-[10px] h-[36px] overflow-hidden bg-pink",
          trackClassName,
        )}
        style={{
          backgroundColor: backgroundColor,
        }}
      >
        <Slider.Range
          className={classNames(
            "absolute rounded-l-lg h-[36px] bg-dark-purple-500",
            rangeClassName,
          )}
          style={{
            backgroundColor: progressColor,
          }}
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
