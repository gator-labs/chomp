import { IconProps } from ".";

function GiftIcon({ fill = "#fff", width = 17, height = 17 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 17 17"
    >
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.53 5.529H2.863a.667.667 0 00-.667.667v1.333c0 .368.299.667.667.667H13.53a.667.667 0 00.666-.667V6.196a.667.667 0 00-.666-.667zM8.196 5.529v8.667"
      ></path>
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.863 8.196v4.666a1.333 1.333 0 01-1.333 1.334H4.863a1.333 1.333 0 01-1.334-1.334V8.196M5.196 5.529a1.667 1.667 0 110-3.333c.643-.012 1.273.3 1.809.895.535.595.95 1.444 1.191 2.438.241-.994.657-1.843 1.192-2.438.535-.595 1.165-.907 1.808-.895a1.667 1.667 0 110 3.333"
      ></path>
    </svg>
  );
}

export default GiftIcon;
