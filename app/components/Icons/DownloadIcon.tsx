import { IconProps } from ".";

function DownloadIcon({
  width = 24,
  height = 24,
  fill = "#0D0D0D",
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
        strokeWidth="2"
        d="M12 17.585v-14M6 11.585l6 6 6-6M19 21.585H5"
      ></path>
    </svg>
  );
}

export default DownloadIcon;
