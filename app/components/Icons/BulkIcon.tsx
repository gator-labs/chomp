import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

const BulkIcon = ({
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 74 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 63.2767C0 63.2767 4.11023 17.0305 16.4409 0.217407L36.9921 4.32818L32.8819 17.0305H24.6614V46.4636H28.7716C36.9921 33.8436 54.0085 29.2395 64.2841 33.8436C77.8478 40.133 76.6148 59.0837 64.2841 67.4697C54.4195 74.2114 24.6614 80.0898 0 63.2767Z"
        fill="#8872A5"
      />
    </svg>
  );
};

export default BulkIcon;
