import { IconProps } from ".";

function UpIcon({ fill = "#fff", width = 12, height = 8 }: IconProps) {
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
        d="M11 7.217a1 1 0 00.707-1.707l-5-5a1 1 0 00-1.414 0l-5 5A1 1 0 001 7.217h10z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export default UpIcon;
