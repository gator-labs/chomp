import { IconProps } from ".";

export function ChevronLeftIcon({
  fill = "none",
  width = 16,
  height = 17,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 17"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 1.21741L1 7.21741L7 13.2174"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
