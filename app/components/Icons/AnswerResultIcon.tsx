import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function AnswerResultIcon({
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
      <g clipPath="url(#clip0_2612_4498)">
        <path
          fill={fill}
          d="M12 20c-1.713 0-3.14-.627-4.284-1.88C6.572 16.867 6 15.307 6 13.44c0-1.333.497-2.783 1.491-4.35C8.485 7.524 9.988 5.827 12 4c2.012 1.827 3.516 3.523 4.51 5.09.994 1.567 1.49 3.017 1.49 4.35 0 1.867-.572 3.427-1.715 4.68C15.14 19.373 13.713 20 12 20z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_2612_4498">
          <path fill={fill} d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}
