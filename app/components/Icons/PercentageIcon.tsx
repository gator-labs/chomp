import React from "react";

export function PercentageIcon({
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
      <g clipPath="url(#clip0_2612_4453)">
        <path
          fill={fill}
          fillRule="evenodd"
          d="M12 4a8 8 0 100 16 8 8 0 000-16zm2.605 9.674a.93.93 0 100 1.86.93.93 0 000-1.86zm-6.14-4.279a.93.93 0 111.86 0 .93.93 0 01-1.86 0zm6.117-.766a.558.558 0 11.79.789L9.417 15.37a.558.558 0 01-.79-.789l5.954-5.953z"
          clipRule="evenodd"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_2612_4453">
          <path fill={fill} d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
