import React from "react";
import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function DragHandleIcon({
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
      <path fill={fill} d="M20 9H4v2h16V9zM4 15h16v-2H4v2z"></path>
    </svg>
  );
}
