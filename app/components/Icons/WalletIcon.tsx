import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function WalletIcon({
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
      viewBox="0 0 24 24"
    >
      <g clipPath="url(#clip0_2690_4091)">
        <path
          fill={fill}
          d="M17.632 5.684a1.58 1.58 0 011.578 1.58v.789h-4.736a3.947 3.947 0 100 7.894h4.736v.79a1.579 1.579 0 01-1.578 1.579H6.579A1.579 1.579 0 015 16.737V7.263a1.579 1.579 0 011.579-1.579h11.053zm.79 3.948A1.579 1.579 0 0120 11.21v1.579a1.579 1.579 0 01-1.579 1.579h-3.947a2.368 2.368 0 110-4.737h3.947zm-3.948 1.579a.79.79 0 100 1.579.79.79 0 000-1.58z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_2690_4091">
          <path fill={fill} d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
