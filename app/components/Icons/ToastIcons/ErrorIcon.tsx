import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from "..";

export function ErrorIcon({
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
        fill="#ED6A5A"
        fillRule="evenodd"
        d="M11 .25C5.063.25.25 5.063.25 11S5.063 21.75 11 21.75 21.75 16.937 21.75 11 16.937.25 11 .25zM8.702 7.641a.75.75 0 00-1.061 1.06L9.939 11l-2.298 2.298a.75.75 0 001.06 1.06L11 12.062l2.298 2.298a.75.75 0 001.06-1.06L12.06 11l2.298-2.298a.75.75 0 10-1.06-1.06L11 9.938 8.702 7.641z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
