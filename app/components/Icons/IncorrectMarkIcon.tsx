import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export default function IncorrectMarkIcon({
  fill = "#ED6A5A",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 17"
    >
      <path
        fill={fill}
        d="M8 .717a8 8 0 108 8 8.008 8.008 0 00-8-8zm2.897 10.026a.615.615 0 11-.87.871L8 9.587l-2.026 2.027a.616.616 0 01-.87-.87L7.13 8.716 5.103 6.691a.616.616 0 11.87-.87L8 7.846l2.026-2.027a.615.615 0 11.87.871L8.87 8.717l2.027 2.026z"
      ></path>
    </svg>
  );
}
