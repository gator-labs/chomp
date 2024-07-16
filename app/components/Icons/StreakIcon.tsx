import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function StreakIcon({
  fill = "#fff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.3333 0.717407L25.9592 4.34324L18.2325 12.0699L11.8992 5.73657L0.166656 17.4849L2.39916 19.7174L11.8992 10.2174L18.2325 16.5507L28.2075 6.59157L31.8333 10.2174V0.717407H22.3333Z"
        fill={fill}
      />
    </svg>
  );
}
