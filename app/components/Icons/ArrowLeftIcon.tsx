import { IconProps } from ".";

export function ArrowLeftIcon({
  width = 24,
  height = 25,
  fill = "#fff",
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
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M18.5 12.217H6m0 0l6-6m-6 6l6 6"
      ></path>
    </svg>
  );
}
