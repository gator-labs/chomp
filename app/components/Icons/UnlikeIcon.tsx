import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

const UnlikeIcon = ({
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
      <g clip-path="url(#clip0_5170_2561)">
        <path
          fillRule="evenodd"
          clip-rule="evenodd"
          d="M14.1949 13.8166L10.9632 17.0483C10.6249 17.3924 10.0765 17.3924 9.73237 17.0541C9.52237 16.8441 9.43487 16.5466 9.4932 16.2549L10.0474 13.5833L6.75154 13.5833C5.49737 13.5833 4.65154 12.2999 5.14154 11.1449L7.0432 6.70577C7.22987 6.27993 7.64987 5.99994 8.11654 5.99994L13.3665 5.99994C14.0082 5.99994 14.5332 6.52494 14.5332 7.1666L14.5332 12.9941C14.5332 13.3033 14.4107 13.6008 14.1949 13.8166ZM15.6999 7.1666C15.6999 6.52494 16.2249 5.99994 16.8665 5.99994C17.5082 5.99994 18.0332 6.52494 18.0332 7.1666L18.0332 11.8333C18.0332 12.4749 17.5082 12.9999 16.8665 12.9999C16.2249 12.9999 15.6999 12.4749 15.6999 11.8333L15.6999 7.1666Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_5170_2561">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default UnlikeIcon;
