import { IconProps } from ".";

export function ChevronRightIcon({
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
        d="M6 12.1274L10 8.12744L6 4.12744"
        stroke="white"
        stroke-width="1.33333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
