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
    primary: "bg-primary text-btn-text-primary",
    secondary: "bg-secondary text-btn-text-secondary",
    warning: "bg-warning text-btn-text-warning",
    white: "bg-white text-btn-text-white",
    black: "bg-black text-btn-text-black",
    pink: "bg-pink text-btn-text-pink",
    "pink-border": "bg-pink-border text-btn-text-pink-border",
    purple: "bg-purple text-btn-text-purple",
    grayish: "bg-grayish text-btn-text-grayish",
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
      <p className="text-center">{children}</p>
    </div>
  );
};

export default Pill;
