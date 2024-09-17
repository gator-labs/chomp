import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from "..";

export function InfoIcon({
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 22 22"
    >
      <path
        fill="#AFADEB"
        fillRule="evenodd"
        d="M10.75.25C4.813.25 0 5.063 0 11s4.813 10.75 10.75 10.75S21.5 16.937 21.5 11 16.687.25 10.75.25zM11 6a1 1 0 100 2h.01a1 1 0 100-2H11zm1.01 5a1 1 0 10-2 0v4a1 1 0 102 0v-4z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
