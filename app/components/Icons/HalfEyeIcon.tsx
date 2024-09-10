import { IconProps } from ".";

function HalfEyeIcon({ fill = "#fff", width = 17, height = 17 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 17 17"
    >
      <path
        fill={fill}
        fillRule="evenodd"
        d="M13.74 9.746c-2.223-4.94-8.865-4.94-11.088 0a.5.5 0 01-.912-.41c2.577-5.727 10.335-5.727 12.912 0a.5.5 0 01-.912.41z"
        clipRule="evenodd"
      ></path>
      <path
        fill={fill}
        fillRule="evenodd"
        d="M8.196 8.707a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm2.5 1.5a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export default HalfEyeIcon;
