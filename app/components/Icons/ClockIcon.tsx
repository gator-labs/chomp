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
      viewBox="0 0 24 24"
    >
      <path
        fill={fill}
        d="M12 5a7 7 0 110 14 7 7 0 010-14zm0 2.8a.7.7 0 00-.7.7V12a.7.7 0 00.205.495l2.1 2.1a.7.7 0 00.99-.99L12.7 11.71V8.5a.7.7 0 00-.7-.7z"
      ></path>
    </svg>
  );
}
