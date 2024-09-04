"use client";

import classNames from "classnames";
import { ReactNode } from "react";

interface PillProps {
  variant?:
    | "primary"
    | "secondary"
    | "warning"
    | "white"
    | "black"
    | "pink"
    | "pink-border"
    | "purple"
    | "grayish";
  size?: "big" | "normal" | "small";
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

const Pill = ({
  variant = "secondary",
  size = "normal",
  onClick,
  children,
  className,
}: PillProps) => {
  const variantStyles = {
    primary: "bg-primary text-gray-950",
    secondary: "bg-secondary text-gray-100",
    warning: "bg-red text-gray-950",
    white: "bg-white text-gray-950",
    black: "bg-gray-850 text-text-gray-100",
    pink: "bg-pink text-gray-950",
    "pink-border": "bg-pink-border text-gray-950-border",
    purple: "bg-purple-500 text-gray-950-500",
    grayish: "bg-gray-700 text-gray-100",
  };

  const sizeStyles = {
    big: "py-4 px-8 text-base font-bold",
    normal: "py-2 px-4 text-sm font-semibold",
    small: "py-1 px-2 text-xs font-normal",
  };

  const variantClasses = variantStyles[variant] || variantStyles.secondary;
  const sizeClasses = sizeStyles[size] || sizeStyles.normal;

  const classNameResult = classNames(
    "flex items-center justify-center rounded-full cursor-pointer",
    variantClasses,
    sizeClasses,
    className,
  );

  return (
    <div className={classNameResult} onClick={onClick}>
      <div className="text-center">{children}</div>
    </div>
  );
};

export default Pill;
