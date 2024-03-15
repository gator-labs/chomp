import React from "react";
import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function CommentIcon({
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
        d="M12.011 4a7.98 7.98 0 00-5.649 2.343A8.005 8.005 0 004.022 12a7.918 7.918 0 001.806 5.063l-1.598 1.6a.8.8 0 00-.168.872.8.8 0 00.76.464h7.19c2.118 0 4.15-.842 5.648-2.343a8.005 8.005 0 000-11.313A7.983 7.983 0 0012.011 4zm0 14.4H6.747l.743-.745a.8.8 0 000-1.128 6.403 6.403 0 012.657-10.65 6.383 6.383 0 017.493 3.102 6.407 6.407 0 01-1.576 7.965 6.386 6.386 0 01-4.053 1.455z"
      ></path>
    </svg>
  );
}
