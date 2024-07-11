import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function DeckIcon({
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
      viewBox="0 0 82 90"
    >
      <path
        fill="#575CDF"
        d="M23.593 6.633a9 9 0 00-9 9v57a9 9 0 009 9h36a9 9 0 009-9v-57a9 9 0 00-9-9h-36z"
      ></path>
      <path
        stroke="#333"
        strokeWidth="2"
        d="M23.593 6.633a9 9 0 00-9 9v57a9 9 0 009 9h36a9 9 0 009-9v-57a9 9 0 00-9-9h-36z"
      ></path>
      <path
        fill="#575CDF"
        d="M13.692 13.365a9 9 0 00-6.364 11.022l14.753 55.058a9 9 0 0011.023 6.364l34.773-9.317a9 9 0 006.364-11.023L59.488 10.41a9 9 0 00-11.022-6.364l-34.774 9.318z"
      ></path>
      <path
        stroke="#333"
        strokeWidth="2"
        d="M13.692 13.365a9 9 0 00-6.364 11.022l14.753 55.058a9 9 0 0011.023 6.364l34.773-9.317a9 9 0 006.364-11.023L59.488 10.41a9 9 0 00-11.022-6.364l-34.774 9.318z"
      ></path>
      <g clipPath="url(#clip0_8178_1142)">
        <path
          fill="#575CDF"
          d="M4.161 33.182A8 8 0 017.09 22.254l31.177-18a8 8 0 0110.928 2.928l28.5 49.363a8 8 0 01-2.928 10.929l-31.177 18a8 8 0 01-10.928-2.929l-28.5-49.363z"
        ></path>
        <path
          fill="#fff"
          d="M41.053 74.81l1.516-.875-.874-1.514 1.516-.875-.875-1.514 6.105-3.524h.003c.003.001.005.003.006.006l.867 1.5 3.012-1.739-.872-1.51 3.064-1.768.873 1.512 1.513-.874 2.63 4.554c.077-.028 4.33-2.476 4.565-2.628l-.87-1.508 3.047-1.76.87 1.509 1.516-.875-.87-1.51 3.041-1.756 4.39 7.603-31.937 18.44-2.632-4.559 1.51-.872-1.759-3.048 1.53-.882-.885-1.533zm16.092-7.232l-1.514.874-.876-1.516c-.001-.003-.005-.004-.006-.005a.231.231 0 00-.004-.001l-1.508.87c.185.349 1.7 2.96 1.753 3.021l3.02-1.744-.865-1.5v.001zm-9.985 3.73l1.747 3.025 3.026-1.747-.863-1.495-1.502.868c-.05 0-.058-.039-.074-.066l-.792-1.37-.045-.079-1.497.863zm19.365-5.099l.873 1.512a36.306 36.306 0 001.49-.868l-.869-1.506-1.494.862zm3.046-1.758l.873 1.511a36.203 36.203 0 001.49-.867l-.87-1.507-1.493.863z"
        ></path>
      </g>
      <path
        stroke="#333"
        strokeWidth="2"
        d="M6.59 21.388a9 9 0 00-3.295 12.294l28.5 49.363A9 9 0 0044.09 86.34l31.177-18a9 9 0 003.294-12.295L50.06 6.682a9 9 0 00-12.294-3.294l-31.177 18z"
      ></path>
      <defs>
        <clipPath id="clip0_8178_1142">
          <path
            fill="#fff"
            d="M4.161 33.182A8 8 0 017.09 22.254l31.177-18a8 8 0 0110.928 2.928l28.5 49.363a8 8 0 01-2.928 10.929l-31.177 18a8 8 0 01-10.928-2.929l-28.5-49.363z"
          ></path>
        </clipPath>
      </defs>
    </svg>
  );
}
