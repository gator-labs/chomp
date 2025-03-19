import { IconProps } from ".";

export function LabelIcon({
  fill = "none",
  width = 17,
  height = 17,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 17 17"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_4488_3327)">
        <path
          d="M8.89068 1.7415C8.64069 1.49143 8.3016 1.35091 7.94801 1.35083H3.16668C2.81305 1.35083 2.47392 1.49131 2.22387 1.74135C1.97382 1.9914 1.83334 2.33054 1.83334 2.68416V7.4655C1.83342 7.81909 1.97394 8.15817 2.22401 8.40816L8.02668 14.2108C8.32969 14.5119 8.73951 14.6809 9.16668 14.6809C9.59385 14.6809 10.0037 14.5119 10.3067 14.2108L14.6933 9.82416C14.9944 9.52115 15.1634 9.11133 15.1634 8.68416C15.1634 8.25699 14.9944 7.84717 14.6933 7.54416L8.89068 1.7415Z"
          stroke="black"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.49999 5.35099C5.68408 5.35099 5.83332 5.20175 5.83332 5.01766C5.83332 4.83356 5.68408 4.68433 5.49999 4.68433C5.31589 4.68433 5.16666 4.83356 5.16666 5.01766C5.16666 5.20175 5.31589 5.35099 5.49999 5.35099Z"
          fill="black"
          stroke="black"
          strokeWidth="1.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4488_3327">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0.5 0.0175781)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
