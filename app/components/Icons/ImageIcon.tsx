import React from "react";
import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function ImageIcon({
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
      <g clipPath="url(#clip0_2587_7031)">
        <path
          fill={fill}
          d="M5.778 20c-.49 0-.907-.174-1.255-.522A1.715 1.715 0 014 18.222V5.778c0-.49.174-.907.523-1.255A1.716 1.716 0 015.778 4h12.444c.49 0 .908.174 1.256.523.349.348.523.766.522 1.255v12.444c0 .49-.174.908-.522 1.256a1.707 1.707 0 01-1.256.522H5.778zm.889-3.556h10.666L14 12l-2.667 3.556-2-2.667-2.666 3.555z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_2587_7031">
          <path fill={fill} d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
