import { IconProps } from ".";

export function QuestionIncorrectIcon({
  fill = "#ED6A5A",
  color = "#000000",
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
        fill={fill}
      />
      <path
        d="M12 19.1667C15.6819 19.1667 18.6667 16.1819 18.6667 12.5C18.6667 8.81814 15.6819 5.83337 12 5.83337C8.3181 5.83337 5.33333 8.81814 5.33333 12.5C5.33333 16.1819 8.3181 19.1667 12 19.1667Z"
        stroke={color}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 10.5L10 14.5"
        stroke={color}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 10.5L14 14.5"
        stroke={color}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
