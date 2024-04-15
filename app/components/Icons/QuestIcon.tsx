import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function QuestIcon({
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
        d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4zm3 14h-2v3h-2v-3H9v-2h2l-1-5.9 2-1.6 2 1.6-1 5.9h2v2z"
      ></path>
    </svg>
  );
}
