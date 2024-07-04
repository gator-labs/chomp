import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function TotalPercentageIcon({
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
      viewBox="0 0 30 29"
    >
      <path
        fill={fill}
        fillRule="evenodd"
        d="M15 0C7.148 0 .783 6.365.783 14.217S7.148 28.435 15 28.435s14.217-6.366 14.217-14.218S22.852 0 15 0zm4.629 17.193a1.653 1.653 0 100 3.307 1.653 1.653 0 000-3.307zM8.718 9.588a1.653 1.653 0 113.306 0 1.653 1.653 0 01-3.306 0zm10.871-1.362a.992.992 0 111.402 1.402l-10.58 10.58a.992.992 0 01-1.402-1.401l10.58-10.58z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
