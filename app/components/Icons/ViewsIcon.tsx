import React from "react";
import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function ViewsIcon({
  fill = "#fff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill={fill}
      viewBox="0 0 24 24"
    >
      <path fill={fill} d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path>
      <path
        fill={fill}
        d="M22.956 11.753a12.152 12.152 0 00-4.307-5.504A12.307 12.307 0 0012 4c-2.39.09-4.702.87-6.65 2.249a12.153 12.153 0 00-4.306 5.504.722.722 0 000 .494 12.152 12.152 0 004.307 5.504A12.306 12.306 0 0012 20c2.39-.09 4.702-.87 6.65-2.249a12.152 12.152 0 004.306-5.504.721.721 0 000-.494zM12 16.727a4.795 4.795 0 01-2.648-.796 4.736 4.736 0 01-1.756-2.122 4.69 4.69 0 01-.271-2.731 4.715 4.715 0 011.304-2.42 4.78 4.78 0 012.441-1.294 4.804 4.804 0 012.754.269 4.759 4.759 0 012.14 1.74A4.7 4.7 0 0116.767 12a4.715 4.715 0 01-1.399 3.34A4.795 4.795 0 0112 16.728z"
      ></path>
    </svg>
  );
}
