import React from "react";

export function FilterIcon({
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
        d="M13.5 12v6.127a.762.762 0 01-.218.646.746.746 0 01-.528.227.724.724 0 01-.529-.227l-1.507-1.564a.774.774 0 01-.218-.645v-4.565h-.022l-4.32-5.74a.799.799 0 01.128-1.088A.764.764 0 016.75 5h10.498a.764.764 0 01.745.688.798.798 0 01-.152.572L13.522 12H13.5z"
      ></path>
    </svg>
  );
}
