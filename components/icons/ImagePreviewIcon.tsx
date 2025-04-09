import { IconProps } from ".";

function ImagePreviewIcon({ width = 38, height = 38 }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.25 2.46741H3.75C2.92157 2.46741 2.25 3.13898 2.25 3.96741V14.4674C2.25 15.2958 2.92157 15.9674 3.75 15.9674H14.25C15.0784 15.9674 15.75 15.2958 15.75 14.4674V3.96741C15.75 3.13898 15.0784 2.46741 14.25 2.46741Z"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.75 8.46741C7.57843 8.46741 8.25 7.79583 8.25 6.96741C8.25 6.13898 7.57843 5.46741 6.75 5.46741C5.92157 5.46741 5.25 6.13898 5.25 6.96741C5.25 7.79583 5.92157 8.46741 6.75 8.46741Z"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.75 11.4674L13.4355 9.15292C13.1542 8.87172 12.7727 8.71375 12.375 8.71375C11.9773 8.71375 11.5958 8.87172 11.3145 9.15292L4.5 15.9674"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export default ImagePreviewIcon;
