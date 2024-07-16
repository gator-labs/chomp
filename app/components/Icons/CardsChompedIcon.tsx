import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function CardsChompedIcon({
  fill = "#fff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 0L0.695633 6.26088V15.6522C0.695633 24.2609 7.15748 32.4 16 34.4348C24.8425 32.4 31.3044 24.2609 31.3044 15.6522V6.26088L16 0ZM21.1014 21.9131H17.7005V26.6087H14.2995V21.9131H10.8985V18.7826H14.2995L12.599 9.54783L16 7.04348L19.401 9.54783L17.7005 18.7826H21.1014V21.9131Z"
        fill={fill}
      />
    </svg>
  );
}
