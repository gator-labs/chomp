import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function TwitterIcon({
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
    >
      <path
        fill={fill}
        d="M14.675.843h2.76l-6.03 6.91 7.095 9.404h-5.554l-4.354-5.703-4.975 5.703H.854l6.449-7.393L.5.844h5.696l3.929 5.212 4.55-5.213Zm-.97 14.658h1.53L5.36 2.413H3.72l9.984 13.088Z"
      />
    </svg>
  );
}
