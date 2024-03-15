import React from "react";
import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function HalfArrowLeftIcon({
  fill = "#fff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill={fill}
        fillRule="evenodd"
        d="M17 6l-6 6 6 6-2 2-8-8 8-8 2 2z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
