import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function CopyIconSimple({
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_6058_3829)">
        <path
          d="M13.3334 5.33331H6.66671C5.93033 5.33331 5.33337 5.93027 5.33337 6.66665V13.3333C5.33337 14.0697 5.93033 14.6666 6.66671 14.6666H13.3334C14.0698 14.6666 14.6667 14.0697 14.6667 13.3333V6.66665C14.6667 5.93027 14.0698 5.33331 13.3334 5.33331Z"
          stroke="black"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.66671 10.6666C1.93337 10.6666 1.33337 10.0666 1.33337 9.33331V2.66665C1.33337 1.93331 1.93337 1.33331 2.66671 1.33331H9.33337C10.0667 1.33331 10.6667 1.93331 10.6667 2.66665"
          stroke="black"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_6058_3829">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
