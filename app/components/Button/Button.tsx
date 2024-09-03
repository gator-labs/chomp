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
    | "grayish";
  size?: "big" | "normal" | "small";
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
    primary: "bg-primary text-grey-950",
    secondary: "bg-secondary text-grey-100",
    warning: "bg-red text-grey-950",
    white: "bg-grey-0 text-grey-950",
    black: "bg-grey-850 text-text-grey-100",
    pink: "bg-pink text-grey-950",
    "pink-border": "bg-grey-950 text-grey-950-border",
    purple: "bg-purple-500 text-grey-950",
    grayish: "bg-grey-700",
    aqua: "bg-aqua text-grey-950",
  };

  const variantClasses = variantStyles[variant] || variantStyles.primary;

  const classNameResult = classNames(
    variantClasses,
    `rounded-lg inline-flex justify-center items-center`,
    {
      "bg-opacity-100 border-grey-0 border-[1px]": variant === "secondary",
      "border-purple-500 border-[1px]": variant === "pink-border",
      "!bg-grey-400": disabled,
      "text-grey-600": disabled,
      "cursor-default": disabled,
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
      "text-grey-950": variant === "white",
    },
    className,
  );

  return (
    <button {...props} disabled={disabled} className={classNameResult}>
      {children}
    </button>
  );
}
