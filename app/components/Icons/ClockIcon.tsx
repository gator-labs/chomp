import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function ClockIcon({
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
      viewBox="0 0 16 16"
    >
      <path
        fill={fill}
        d="M8 .717a7.5 7.5 0 110 15 7.5 7.5 0 010-15zm0 3a.75.75 0 00-.75.75v3.75c0 .2.08.39.22.53l2.25 2.25a.75.75 0 001.06-1.06l-2.03-2.03v-3.44a.75.75 0 00-.75-.75z"
      ></path>
    </svg>
  );
}
