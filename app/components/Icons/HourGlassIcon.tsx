import { IconProps } from ".";

function HourGlassIcon({ width = 17, height = 17 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 17 17"
    >
      <g clipPath="url(#clip0_376_1594)">
        <path
          fill="#AFADEB"
          d="M4.863 5.172V2.506h6.667v2.666l-3 3v.667l3 3.333v3H4.863v-3l3-3.333v-.667l-3-3z"
        ></path>
        <path
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.333"
          d="M3.53 15.506h9.333M3.53 2.172h9.333M11.53 15.506v-2.782c0-.353-.141-.692-.391-.942L8.196 8.839l-2.943 2.943c-.25.25-.39.589-.39.942v2.782"
        ></path>
        <path
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.333"
          d="M4.863 2.172v2.782c0 .353.14.692.39.942L8.196 8.84l2.943-2.943c.25-.25.39-.589.39-.942V2.172"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_376_1594">
          <path
            fill="#fff"
            d="M0 0H16V16H0z"
            transform="translate(.196 .84)"
          ></path>
        </clipPath>
      </defs>
    </svg>
  );
}

export default HourGlassIcon;
