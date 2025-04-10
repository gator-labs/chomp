import { IconProps } from ".";

function AquaCheckIcon({ width = 38, height = 38 }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 16.2174C0 7.38085 7.16344 0.217407 16 0.217407C24.8366 0.217407 32 7.38085 32 16.2174C32 25.054 24.8366 32.2174 16 32.2174C7.16344 32.2174 0 25.054 0 16.2174Z"
        fill="#1ED3B3"
      />
      <path
        d="M16 26.2174C21.5228 26.2174 26 21.7403 26 16.2174C26 10.6946 21.5228 6.21741 16 6.21741C10.4772 6.21741 6 10.6946 6 16.2174C6 21.7403 10.4772 26.2174 16 26.2174Z"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 16.2174L15 18.2174L19 14.2174"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default AquaCheckIcon;
