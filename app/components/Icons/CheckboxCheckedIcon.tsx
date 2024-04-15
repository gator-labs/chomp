import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function CheckboxCheckedIcon({
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
        fill="#CFFBE2"
        stroke={fill}
        d="M5.5 9A3.5 3.5 0 019 5.5h6A3.5 3.5 0 0118.5 9v6a3.5 3.5 0 01-3.5 3.5H9A3.5 3.5 0 015.5 15V9z"
      ></path>
      <rect width="8" height="8" x="8" y="8" fill="#6DECAF" rx="2"></rect>
    </svg>
  );
}
