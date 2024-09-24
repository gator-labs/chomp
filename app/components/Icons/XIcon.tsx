import { IconProps } from ".";

function XIcon({ width = 38, height = 38, fill = "#fff" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 38 38"
    >
      <rect width="38" height="38" fill="#A3A3EC" rx="19"></rect>
      <path
        fill={fill}
        d="M24.963 11h2.914l-6.365 7.201L29 28h-5.863l-4.592-5.943L13.291 28h-2.917l6.809-7.702L10 11h6.012l4.151 5.432 4.8-5.432zm-1.022 15.274h1.615L15.134 12.636H13.4l10.54 13.638z"
      ></path>
    </svg>
  );
}

export default XIcon;
