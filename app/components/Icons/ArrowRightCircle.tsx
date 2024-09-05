import { IconProps } from ".";

export function ArrowRightCircle({
  width = 24,
  height = 25,
  fill = "#AFADEB",
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 25"
    >
      <path
        fill={fill}
        fillRule="evenodd"
        d="M12 1.75C6.063 1.75 1.25 6.563 1.25 12.5S6.063 23.25 12 23.25s10.75-4.813 10.75-10.75S17.937 1.75 12 1.75zm1.03 6.72l3.5 3.5a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 11-1.06-1.06l2.22-2.22H8a.75.75 0 010-1.5h6.19l-2.22-2.22a.75.75 0 011.06-1.06z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
