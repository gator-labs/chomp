import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function RefreshIcon({
  fill = "#fff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 12C4.5 9.87827 5.34285 7.84344 6.84315 6.34315C8.34344 4.84285 10.3783 4 12.5 4C14.7365 4.00841 16.8831 4.88109 18.4911 6.43556L20.5 8.44444"
        stroke="white"
        stroke-width="1.77778"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M20.5 4V8.44444H16.0555"
        stroke="white"
        stroke-width="1.77778"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M20.5 12C20.5 14.1217 19.6571 16.1566 18.1569 17.6569C16.6566 19.1571 14.6217 20 12.5 20C10.2635 19.9916 8.11686 19.1189 6.50889 17.5644L4.5 15.5556"
        stroke="white"
        stroke-width="1.77778"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.94444 15.5555H4.5V20"
        stroke="white"
        stroke-width="1.77778"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
