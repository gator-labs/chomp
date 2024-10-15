import { IconProps } from ".";

function DoubleCardIcon({ fill = "#fff", width = 20, height = 20 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 20 21"
    >
      <path
        fill={fill}
        fillRule="evenodd"
        d="M11.116 1.904a.6.6 0 00-.734.424L7.466 13.212a.6.6 0 00.425.733l7.603 2.038a.6.6 0 00.734-.425l2.918-10.883a.6.6 0 00-.425-.735l-7.605-2.036zM5.958 12.807l1.995-7.443-5.841 1.563a.6.6 0 00-.425.735l2.918 10.883a.6.6 0 00.734.425l7.604-2.038.029-.008-5.487-1.469a2.163 2.163 0 01-1.528-2.65v.002z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export default DoubleCardIcon;
