import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export default function CheckMarkIcon({
  fill = "#6DECAF",
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
        fillRule="evenodd"
        d="M8 16.5A7.999 7.999 0 108 .502 7.999 7.999 0 008 16.5zm-.206-4.764l4.444-5.334-1.365-1.138L7.05 9.85 5.073 7.872 3.816 9.128l2.667 2.667.688.688.623-.747z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
