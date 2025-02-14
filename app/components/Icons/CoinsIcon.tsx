import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function CoinsIcon({
  fill = "none",
  stroke = "#ffffff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 11 11"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_4245_3364)">
        <path
          d="M6.86271 5.47323C5.71212 5.47323 4.77938 5.00686 4.77938 4.43156C4.77938 3.85626 5.71212 3.38989 6.86271 3.38989C8.0133 3.38989 8.94604 3.85626 8.94604 4.43156C8.94604 5.00686 8.0133 5.47323 6.86271 5.47323Z"
          stroke={stroke}
          strokeWidth="0.636162"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.77938 6.09814C4.77938 6.67344 5.71212 7.13981 6.86271 7.13981C8.0133 7.13981 8.94604 6.67344 8.94604 6.09814"
          stroke={stroke}
          strokeWidth="0.636162"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.446 4.01477C1.446 4.59007 2.37874 5.05644 3.52934 5.05644C3.99843 5.05644 4.43131 4.97892 4.77954 4.8481"
          stroke={stroke}
          strokeWidth="0.636162"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.44596 5.47314C1.44596 6.04844 2.3787 6.51481 3.5293 6.51481C3.9983 6.51481 4.43111 6.43732 4.7793 6.30655"
          stroke={stroke}
          strokeWidth="0.636162"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.44596 2.34814V6.93148C1.44596 7.50677 2.3787 7.97314 3.5293 7.97314C3.99831 7.97314 4.4311 7.89558 4.7793 7.76481"
          stroke={stroke}
          strokeWidth="0.636162"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.61279 3.59814V2.34814"
          stroke={stroke}
          strokeWidth="0.636162"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.77938 4.43152V7.76485C4.77938 8.34015 5.71212 8.80652 6.86271 8.80652C8.0133 8.80652 8.94604 8.34015 8.94604 7.76485V4.43152"
          stroke={stroke}
          strokeWidth="0.636162"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.52946 3.38985C2.37887 3.38985 1.44613 2.92348 1.44613 2.34819C1.44613 1.77289 2.37887 1.30652 3.52946 1.30652C4.68005 1.30652 5.61279 1.77289 5.61279 2.34819C5.61279 2.92348 4.68005 3.38985 3.52946 3.38985Z"
          stroke={stroke}
          strokeWidth="0.636162"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4245_3364">
          <rect
            width="10"
            height="10"
            fill={fill}
            transform="translate(0.196045 0.0565186)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
