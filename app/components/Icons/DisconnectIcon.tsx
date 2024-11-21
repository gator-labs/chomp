/* eslint-disable prettier/prettier */
import { IconProps } from ".";

function DisconnectIcon({ width = 38, height = 38 }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 21.2174H5C4.46957 21.2174 3.96086 21.0067 3.58579 20.6316C3.21071 20.2565 3 19.7478 3 19.2174V5.21741C3 4.68697 3.21071 4.17827 3.58579 3.80319C3.96086 3.42812 4.46957 3.21741 5 3.21741H9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17.2174L21 12.2174L16 7.21741"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12.2174H9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default DisconnectIcon;
