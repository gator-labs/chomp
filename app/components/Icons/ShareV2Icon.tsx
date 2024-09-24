import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

function ShareV2Icon({
  fill = "#fff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
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
        d="M18 8.217a3 3 0 100-6 3 3 0 000 6zM6 15.217a3 3 0 100-6 3 3 0 000 6zM18 22.217a3 3 0 100-6 3 3 0 000 6zM8.59 13.727l6.83 3.98m-.01-10.98l-6.82 3.98"
      ></path>
    </svg>
  );
}

export default ShareV2Icon;
