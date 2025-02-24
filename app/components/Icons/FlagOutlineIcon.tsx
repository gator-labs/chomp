import React from "react";

import { IconProps } from ".";

export const FlagOutlineIcon: React.FC<IconProps> = ({
  fill = "none",
  width = 16,
  height = 17,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 17"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.1785 10.1893C3.1785 10.1893 3.76183 9.60596 5.51183 9.60596C7.26183 9.60596 8.4285 10.7726 10.1785 10.7726C11.9285 10.7726 12.5118 10.1893 12.5118 10.1893V3.18929C12.5118 3.18929 11.9285 3.77262 10.1785 3.77262C8.4285 3.77262 7.26183 2.60596 5.51183 2.60596C3.76183 2.60596 3.1785 3.18929 3.1785 3.18929V10.1893Z"
        stroke="#0D0D0D"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.1785 14.2725V10.1892"
        stroke="#0D0D0D"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
