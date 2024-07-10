import { IconProps } from ".";

function DownIcon({ fill = "#fff", width = 12, height = 8 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 12 8"
    >
      <path
        fill={fill}
        fillRule="evenodd"
        d="M1 .217a1 1 0 00-.707 1.708l5 5a1 1 0 001.414 0l5-5A1 1 0 0011 .217H1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export default DownIcon;
