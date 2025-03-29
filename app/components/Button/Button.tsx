import classNames from "classnames";
import { ReactNode } from "react";

type ButtonProps = {
  variant?:
    | "primary"
    | "secondary"
    | "warning"
    | "white"
    | "black"
    | "pink"
    | "pink-border"
    | "purple"
    | "aqua"
    | "blue"
    | "grayish"
    | "green";
  size?: "big" | "normal" | "small" | "tiny";
  disabled?: boolean;
  children: ReactNode;
  isFullWidth?: boolean;
  isPill?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "secondary",
  size = "normal",
  disabled = false,
  children,
  isFullWidth = true,
  isPill = false,
  className,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-gray-900",
    warning: "bg-destructive text-gray-900",
    white: "bg-white text-gray-900",
    black: "bg-gray-800 text-text-gray-100",
    pink: "bg-pink text-gray-900",
    "pink-border": "bg-gray-900 text-gray-900-border",
    purple: "bg-purple-500 text-white",
    blue: "bg-chomp-blue-light text-black",
    grayish: "bg-gray-600",
    aqua: "bg-aqua text-gray-900",
    green: "bg-green text-gray-900",
  };

  const variantClasses = variantStyles[variant] || variantStyles.primary;

  const classNameResult = classNames(
    variantClasses,
    `rounded-lg inline-flex justify-center items-center`,
    {
      "bg-opacity-100 border-white border-[1px]": variant === "secondary",
      "border-purple-500 border-[1px]": variant === "pink-border",
      "!bg-gray-400": disabled,
      "text-gray-500": disabled,
      "cursor-default": disabled,
      "py-0 px-2 text-xs font-normal": size === "tiny",
      "py-2 px-4": size === "small",
      "py-4 px-8": size === "normal",
      "py-4 px-16": size === "big",
      "rounded-2xl": size === "big",
      "font-semibold": size === "normal" || size === "small",
      "font-bold": size === "big",
      "text-sm": size === "normal" || size === "small",
      "text-base": size === "big",
      "w-full": isFullWidth,
      "!rounded-full": isPill,
      "text-gray-900": variant === "white",
    },
    className,
  );

  return (
    <button {...props} disabled={disabled} className={classNameResult}>
      {children}
    </button>
  );
}
