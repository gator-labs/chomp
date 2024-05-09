import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function ExitIcon({
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
      <g clipPath="url(#clip0_3564_2910)">
        <path
          fill={fill}
          d="M15.857 15.932V12.09H10.68a.562.562 0 01-.404-.173.601.601 0 010-.836.562.562 0 01.404-.173h5.178V7.07c0-.55-.211-1.075-.586-1.463A1.97 1.97 0 0013.857 5H7a1.97 1.97 0 00-1.414.606A2.107 2.107 0 005 7.068v8.864c0 .548.211 1.074.586 1.462A1.97 1.97 0 007 18h6.857a1.97 1.97 0 001.414-.606c.375-.388.586-.914.586-1.462zm3.192-3.841l-1.881 1.946a.602.602 0 00.01.825.561.561 0 00.798.01l2.857-2.954a.602.602 0 000-.836l-2.857-2.954a.561.561 0 00-.798.01.6.6 0 00-.01.825l1.881 1.946h-3.192v1.182h3.192z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_3564_2910">
          <path fill={fill} d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
