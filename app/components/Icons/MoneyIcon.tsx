import React from "react";
import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function MoneyIcon({
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
        d="M12.005 22.003c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10zm-3.5-8v2h2.5v2h2v-2h1a2.5 2.5 0 000-5h-4a.5.5 0 110-1h5.5v-2h-2.5v-2h-2v2h-1a2.5 2.5 0 100 5h4a.5.5 0 010 1h-5.5z"
      ></path>
    </svg>
  );
}
