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
    <div className="relative flex items-center select-none touch-none w-full h-[50px] px-4 bg-pink-gradient rounded-[8px]">
      <Slider.Root
        className={classNames(
          "relative flex items-center select-none touch-none w-full h-0.5 bg-white bg-opacity-40",
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
            "relative grow rounded-[10px] overflow-hidden ",
            trackClassName,
          )}
          style={{
            backgroundColor: backgroundColor,
          }}
        ></Slider.Track>
        {!hideThumb && (
          <Slider.Thumb
            className="block w-[30px] h-[19px] bg-white rounded-2xl focus:outline-none cursor-pointer shadow-lg overflow-hidde relative"
            aria-label="Volume"
          >
            <div className="w-[calc(100%-4px)] h-[calc(100%-4px)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-dark-purple" />
          </Slider.Thumb>
        )}
      </Slider.Root>
    </div>
  );
};

export default PrimarySlider;
