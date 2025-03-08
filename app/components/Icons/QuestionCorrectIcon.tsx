import { IconProps } from ".";

export function QuestionCorrectIcon({
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
        d="M0 4.5C0 2.29086 1.79086 0.5 4 0.5H20C22.2091 0.5 24 2.29086 24 4.5V20.5C24 22.7091 22.2091 24.5 20 24.5H4C1.79086 24.5 0 22.7091 0 20.5V4.5Z"
        fill="#1ED3B3"
      />
      <path
        d="M11.9999 19.1667C15.6818 19.1667 18.6666 16.1819 18.6666 12.5C18.6666 8.81814 15.6818 5.83337 11.9999 5.83337C8.31805 5.83337 5.33328 8.81814 5.33328 12.5C5.33328 16.1819 8.31805 19.1667 11.9999 19.1667Z"
        stroke="black"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12.5L11.3333 13.8333L14 11.1666"
        stroke="black"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
