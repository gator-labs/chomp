import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function PenIcon({
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
      viewBox="0 0 12 13"
    >
      <path
        fill={fill}
        d="M0 12.467V9.634L8.8.851c.133-.122.28-.217.442-.284a1.38 1.38 0 011.025 0c.166.067.31.167.433.3l.917.934c.133.122.23.266.292.433a1.43 1.43 0 010 1.009c-.061.161-.159.308-.292.441l-8.784 8.783H0zm9.733-8.8l.934-.933-.934-.933-.933.933.933.933z"
      ></path>
    </svg>
  );
}
