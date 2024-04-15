import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function CommunityIcon({
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
        fillRule="evenodd"
        d="M6 6a3 3 0 013-3h10a3 3 0 013 3v12a3 3 0 01-3 3h-3.51a3.82 3.82 0 00.51-1.911v-5.438a3.87 3.87 0 00-1.172-2.766l-4-3.911C9.52 5.694 7.53 5.487 6 6.351V6zm11 1a1 1 0 112 0 1 1 0 01-2 0zm-3-1a1 1 0 100 2h.001a1 1 0 100-2H14zm3 6a1 1 0 112 0 1 1 0 01-2 0zm1 4a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      ></path>
      <path
        fill={fill}
        fillRule="evenodd"
        d="M5.879 8.707a3 3 0 014.242 0l3 3A3 3 0 0114 13.828V18a3 3 0 01-3 3H9v-3a1 1 0 10-2 0v3H5a3 3 0 01-3-3v-4.172a3 3 0 01.879-2.12l3-3v-.001z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}
