import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from "..";

export function RemoveIcon({
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
        fill="#fff"
        fillRule="evenodd"
        d="M6.227 6.227a.75.75 0 011.06 0L12 10.939l4.712-4.712a.75.75 0 011.061 1.06L13.061 12l4.712 4.712a.75.75 0 01-1.06 1.061L12 13.061l-4.712 4.712a.75.75 0 11-1.061-1.06L10.939 12 6.227 7.288a.75.75 0 010-1.061z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
