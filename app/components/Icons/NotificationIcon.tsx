import React from "react";
import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function NotificationIcon({
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
        d="M18 16.333V17H6v-.667L7.333 15v-4a4.66 4.66 0 013.334-4.473v-.194a1.333 1.333 0 112.666 0v.194A4.66 4.66 0 0116.667 11v4L18 16.333zm-4.667 1.334a1.333 1.333 0 11-2.666 0"
      ></path>
    </svg>
  );
}
