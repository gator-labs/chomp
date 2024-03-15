import React from "react";

export function ProfileIcon({
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
        fillRule="evenodd"
        d="M12 4a8 8 0 00-6.96 11.947A4.99 4.99 0 019 14h6a4.99 4.99 0 013.96 1.947A8 8 0 0012 4zm7.943 14.076A9.96 9.96 0 0022 12c0-5.523-4.477-10-10-10S2 6.477 2 12a9.958 9.958 0 002.057 6.076l-.005.018.355.413A9.98 9.98 0 0012 22a9.947 9.947 0 005.675-1.765 10.056 10.056 0 001.918-1.728l.355-.413-.005-.018zM12 6a3 3 0 100 6 3 3 0 000-6z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
