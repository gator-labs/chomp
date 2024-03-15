import React from "react";
import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function CloseIcon({
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
      <g clipPath="url(#clip0_2585_3940)">
        <g clipPath="url(#clip1_2585_3940)">
          <path
            fill={fill}
            fillRule="evenodd"
            d="M12 14.122l5.303 5.303a1.5 1.5 0 102.122-2.122L14.12 12l5.304-5.303a1.5 1.5 0 00-2.122-2.12L12 9.878 6.697 4.576a1.5 1.5 0 10-2.122 2.12L9.88 12l-5.304 5.304a1.5 1.5 0 102.122 2.12l5.302-5.3"
            clipRule="evenodd"
          ></path>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_2585_3940">
          <path fill={fill} d="M0 0H24V24H0z"></path>
        </clipPath>
        <clipPath id="clip1_2585_3940">
          <path fill={fill} d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
