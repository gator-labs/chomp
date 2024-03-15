import React from "react";

export function BookmarkIcon({
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
        stroke={fill}
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M16.25 7.444v10.414l-3.952-1.713a.75.75 0 00-.596 0L7.75 17.858V7.444c0-.199.062-.35.203-.491a.624.624 0 01.476-.203h7.142c.19 0 .335.06.476.202a.649.649 0 01.203.492v0z"
      ></path>
    </svg>
  );
}
