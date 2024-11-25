import { IconProps } from ".";

function XIconWhite({ width = 38, height = 38 }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2991_2783)">
        <mask
          id="mask0_2991_2783"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={width}
          height={height}
        >
          <path d="M0 0.217407H14V14.2174H0V0.217407Z" fill="white" />
        </mask>
        <g mask="url(#mask0_2991_2783)">
          <path
            d="M11.025 0.873413H13.172L8.482 6.24741L14 13.5614H9.68L6.294 9.12641L2.424 13.5614H0.275L5.291 7.81141L0 0.874413H4.43L7.486 4.92741L11.025 0.873413ZM10.27 12.2734H11.46L3.78 2.09441H2.504L10.27 12.2734Z"
            fill="white"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_2991_2783">
          <rect
            width={width}
            height={height}
            fill="white"
            transform="translate(0 0.217407)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export default XIconWhite;
