import { ReactNode } from "react";

interface Props {
  color?: string;
  percentage: number;
  radius?: number;
  cx?: number;
  cy?: number;
  width?: number;
  height?: number;
  children?: ReactNode;
}

const Circle = ({
  color,
  percentage,
  radius = 12,
  cx = 13,
  cy = 13,
  width = 26,
  height = 26,
  children,
}: Props) => {
  const circ = 2 * Math.PI * radius;
  const strokePct = ((100 - percentage) * circ) / 100;

  return (
    <svg width={width} height={height}>
      <circle
        r={radius}
        cx={cx}
        cy={cy}
        fill="transparent"
        stroke={strokePct !== circ ? color : ""}
        strokeWidth="2px"
        strokeDasharray={circ}
        strokeDashoffset={percentage ? strokePct : 0}
        className="transition-all duration-100"
      ></circle>
      {children}
    </svg>
  );
};

export default Circle;
