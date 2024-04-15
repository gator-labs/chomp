import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function InfoIcon({
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
        d="M11.2 9.6h1.6V8h-1.6m.8 10.4A6.408 6.408 0 015.6 12c0-3.528 2.872-6.4 6.4-6.4 3.528 0 6.4 2.872 6.4 6.4 0 3.528-2.872 6.4-6.4 6.4zM12 4a8 8 0 100 16 8 8 0 000-16zm-.8 12h1.6v-4.8h-1.6V16z"
      ></path>
    </svg>
  );
}
