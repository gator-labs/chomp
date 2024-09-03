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
    primary: "bg-primary text-grey-950",
    secondary: "bg-secondary text-grey-100",
    warning: "bg-red text-grey-950",
    white: "bg-grey-0 text-grey-950",
    black: "bg-grey-850 text-text-grey-100",
    pink: "bg-pink text-grey-950",
    "pink-border": "bg-pink-border text-grey-950-border",
    purple: "bg-purple-500 text-grey-950-500",
    grayish: "bg-grey-700 text-grey-100",
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
