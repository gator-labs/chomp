import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

const LikeIcon = ({
  fill = "#0D0D0D",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_5170_1115)">
        <path
          fillRule="evenodd"
          clip-rule="evenodd"
          d="M8.83833 9.49053L12.07 6.25886C12.4083 5.91469 12.9567 5.91469 13.3008 6.25303C13.5108 6.46303 13.5983 6.76053 13.54 7.05219L12.9858 9.72386H16.2817C17.5358 9.72386 18.3817 11.0072 17.8917 12.1622L15.99 16.6014C15.8033 17.0272 15.3833 17.3072 14.9167 17.3072H9.66667C9.025 17.3072 8.5 16.7822 8.5 16.1405V10.313C8.5 10.0039 8.6225 9.70636 8.83833 9.49053ZM7.33333 16.1405C7.33333 16.7822 6.80833 17.3072 6.16667 17.3072C5.525 17.3072 5 16.7822 5 16.1405V11.4739C5 10.8322 5.525 10.3072 6.16667 10.3072C6.80833 10.3072 7.33333 10.8322 7.33333 11.4739V16.1405Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_5170_1115">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default LikeIcon;
