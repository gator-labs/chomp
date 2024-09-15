import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function BackIconOutline({
  fill = "#fff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 25 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H6.5M6.5 12L12.5 6M6.5 12L12.5 18" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>    
  );
}
