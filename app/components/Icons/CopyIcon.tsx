import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function CopyIcon({
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
      <g fill={fill} clipPath="url(#clip0_3564_2906)">
        <path d="M8 11.588c0-2.163 0-3.244.644-3.916C9.289 7 10.325 7 12.4 7h2.2c2.074 0 3.111 0 3.755.672.645.672.645 1.753.645 3.916v3.824c0 2.163 0 3.244-.645 3.916C17.711 20 16.674 20 14.6 20h-2.2c-2.075 0-3.111 0-3.756-.672C8 18.656 8 17.575 8 15.412v-3.824z"></path>
        <path
          d="M5.886 4.918C5 5.835 5 7.312 5 10.265v1.567c0 2.953 0 4.43.886 5.347.466.484 1.083.713 1.98.821-.145-.658-.145-1.563-.145-2.866V11.36c0-2.135 0-3.203.637-3.866.638-.664 1.663-.664 3.716-.664h2.177c1.248 0 2.116 0 2.749.15-.104-.935-.325-1.577-.794-2.062C15.322 4 13.896 4 11.046 4s-4.275 0-5.16.918z"
          opacity="0.5"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_3564_2906">
          <path fill={fill} d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
