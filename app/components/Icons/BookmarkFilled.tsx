import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function BookmarkFilled({
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
        d="M7 19V7.444c0-.397.14-.737.42-1.02C7.7 6.143 8.036 6 8.429 6h7.142c.393 0 .73.142 1.01.425.28.283.42.623.419 1.02V19l-5-2.167L7 19z"
      ></path>
    </svg>
  );
}
