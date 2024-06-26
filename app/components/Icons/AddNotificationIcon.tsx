import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function AddNotificationIcon({
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
      <path
        fill={fill}
        d="M11.4 20a1.54 1.54 0 01-1.13-.47 1.544 1.544 0 01-.47-1.13H13c0 .44-.156.817-.47 1.13-.313.314-.69.47-1.13.47zM5 17.6V16h1.6v-5.6c0-1.107.333-2.09 1-2.95a4.619 4.619 0 012.6-1.69V5.2c0-.333.117-.617.35-.85.234-.233.517-.35.85-.35.333 0 .617.117.85.35.234.234.35.517.35.85v.56c.24.067.473.143.7.23.227.087.44.197.64.33a4.35 4.35 0 00-.45.67 8.32 8.32 0 00-.35.73 3.536 3.536 0 00-.82-.38c-.293-.093-.6-.14-.92-.14-.88 0-1.633.313-2.26.94a3.081 3.081 0 00-.94 2.26V16h6.4v-2.46c.227.2.473.384.74.55.267.167.553.304.86.41V16h1.6v1.6H5zm12-4.8v-2.4h-2.4V8.8H17V6.4h1.6v2.4H21v1.6h-2.4v2.4H17z"
      ></path>
    </svg>
  );
}
