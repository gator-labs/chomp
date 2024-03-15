import React from "react";

export function BackIcon({
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
      <g clipPath="url(#clip0_2585_3945)">
        <path
          fill={fill}
          d="M11.438 18.75L4.688 12l6.75-6.75M5.625 12h13.688H5.624z"
        ></path>
        <path
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.25"
          d="M11.438 18.75L4.688 12l6.75-6.75M5.625 12h13.688"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_2585_3945">
          <path fill={fill} d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
