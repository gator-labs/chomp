import React from "react";

export function ShareIcon({
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
        d="M20 11.067L13.778 5v3.467C7.556 9.333 4.888 13.667 4 18c2.222-3.033 5.333-4.42 9.778-4.42v3.553L20 11.067z"
      ></path>
    </svg>
  );
}
