import { IconProps } from ".";

export function XMarkIcon({
  fill = "none",
  width = 24,
  height = 25,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.75729 17.46L11.9999 12.2174M17.2426 6.97477L11.9999 12.2174M11.9999 12.2174L6.75729 6.97477M11.9999 12.2174L17.2426 17.46"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
