import React from "react";

export function OpenLinkIcon({
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
        d="M8.75 7.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25v-1.5a.75.75 0 111.5 0v1.5A2.75 2.75 0 0115.25 18h-6.5A2.75 2.75 0 016 15.25v-6.5A2.75 2.75 0 018.75 6h1.5a.75.75 0 110 1.5h-1.5zM12 6.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 11-1.5 0V8.561l-3.22 3.22a.75.75 0 11-1.06-1.061l3.22-3.22h-2.69a.75.75 0 01-.75-.75z"
      ></path>
    </svg>
  );
}
