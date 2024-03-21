import React from "react";
import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function CountdownIcon({
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
      className="animate-spin"
    >
      <path
        fill="#666"
        d="M20 12a8 8 0 11-16 0 8 8 0 0116 0zM7.735 12a4.265 4.265 0 108.53 0 4.265 4.265 0 00-8.53 0z"
      ></path>
      <path
        fill={fill}
        d="M20 12a8 8 0 11-2.343-5.657l-2.641 2.641A4.265 4.265 0 1016.266 12H20z"
      ></path>
    </svg>
  );
}
