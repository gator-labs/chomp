import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function ChallengeIcon({
  fill = "#fff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill={fill}
        d="M17.667 5.572c-.346 0-.687.074-1 .218v-.54c0-.535-.198-1.054-.559-1.462a2.356 2.356 0 00-1.41-.76 2.404 2.404 0 00-1.585.306c-.474.28-.828.715-.999 1.226a2.402 2.402 0 00-2.305.044 2.29 2.29 0 00-.834.82c-.2.34-.305.723-.306 1.112v5.143l-.318-.492a2.323 2.323 0 00-1.412-1.045 2.408 2.408 0 00-1.765.22 2.264 2.264 0 00-1.09 1.356 2.18 2.18 0 00.218 1.704c1.333 2.713 2.41 4.638 3.643 5.84C9.189 20.482 10.602 21 12.668 21a7.48 7.48 0 005.182-2.073A6.954 6.954 0 0020 13.929V7.822a2.21 2.21 0 00-.683-1.59 2.377 2.377 0 00-1.65-.66zm1 8.357a5.69 5.69 0 01-1.759 4.089 6.12 6.12 0 01-4.24 1.696c-1.697 0-2.791-.392-3.776-1.354-1.102-1.077-2.117-2.904-3.397-5.51a.496.496 0 00-.025-.046.935.935 0 01-.1-.732.97.97 0 01.466-.585c.23-.128.503-.163.76-.097a.996.996 0 01.618.468l1.555 2.41c.077.12.191.211.327.262a.69.69 0 00.423.018.668.668 0 00.35-.231.628.628 0 00.133-.388V6.536c0-.255.106-.5.293-.681.188-.181.442-.283.707-.283.265 0 .52.102.707.283.188.18.293.426.293.681v4.822c0 .17.07.334.195.454a.68.68 0 00.471.188.68.68 0 00.472-.188.632.632 0 00.195-.454V5.25c0-.256.105-.501.293-.682.187-.18.442-.282.707-.282.265 0 .52.101.707.282.187.18.293.426.293.682v6.107c0 .17.07.334.195.454A.68.68 0 0016 12a.68.68 0 00.471-.188.632.632 0 00.195-.454V7.822c0-.256.106-.5.293-.682.188-.18.442-.282.707-.282.265 0 .52.101.707.282.188.181.293.426.293.682v6.107z"
      ></path>
    </svg>
  );
}
