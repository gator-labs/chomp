import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

const LeadToIcon = ({
  fill = "#fff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 14"
    >
      <path
        fill={fill}
        d="M16 6.284L9.778.217v3.467C3.556 4.551.888 8.884 0 13.217c2.222-3.033 5.333-4.42 9.778-4.42v3.554L16 6.284z"
      ></path>
    </svg>
  );
};

export default LeadToIcon;
