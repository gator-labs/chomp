// This slider component refers to new design of slider component shown in the figma design.

"use client";
import * as Slider from "@radix-ui/react-slider";
import classNames from "classnames";
import { PointerEventHandler, TouchEventHandler } from "react";

interface PrimarySliderV2Props {
  value: number;
  setValue?: (value: number) => void;
  backgroundColor?: string;
  progressColor?: string;
  hideThumb?: boolean;
  className?: string;
  trackClassName?: string;
  rangeClassName?: string;
  onPointerDown?: PointerEventHandler<HTMLSpanElement> | undefined;
  onTouchStart?: TouchEventHandler<HTMLSpanElement> | undefined;
  isSliderTouched?: boolean;
}

const PrimarySliderV2 = ({
  value,
  setValue,
  backgroundColor,
  progressColor,
  hideThumb = false,
  className,
  trackClassName,
  rangeClassName,
  onPointerDown,
  onTouchStart,
  isSliderTouched,
}: PrimarySliderV2Props) => {
  return (
    <div
      className={`bg-pink-gradient px-5 rounded-[8px]`}
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      <Slider.Root
        className={classNames(
          "relative flex items-center select-none touch-none w-full min-h-[50px]",
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
            "relative flex items-center justify-center w-full rounded-[8px] min-h-[50px] overflow-hidden bg-pink-gradient",
            trackClassName,
          )}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <Slider.Range
            className={classNames(
              "rounded-l-lg h-[2px] mx-auto w-full bg-[#FFFFFF] bg-opacity-50",
              rangeClassName,
            )}
            style={{
              backgroundColor: progressColor,
            }}
          />
        </Slider.Track>
        {!hideThumb && (
          <Slider.Thumb
              onPointerDown={onPointerDown}
              onTouchStart={onTouchStart}
            className="block w-[30px] h-[19px] bg-white rounded-2xl focus:outline-none px-[2px] cursor-pointer p-[2px] shadow-[0px_4px_4px_0px_#00000040]"
            aria-label="Volume"
          >
            <div
              className={classNames("w-full h-full rounded-2xl", {
                "bg-[#575CDF]": isSliderTouched,
                "animate-purplePulse": !isSliderTouched,
              })}
            />
          </Slider.Thumb>
        )}
      </Slider.Root>
    </div>
  );
};

export default PrimarySliderV2;
