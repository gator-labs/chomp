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
  dataTestId?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "secondary",
  size = "normal",
  disabled = false,
  children,
  isFullWidth = true,
  isPill = false,
  dataTestId = 'button-test-id',
  className,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-primary text-btn-text-primary",
    secondary: "bg-secondary text-btn-text-secondary",
    warning: "bg-warning text-btn-text-warning",
    white: "bg-white text-btn-text-white",
    black: "bg-black text-btn-text-black",
    pink: "bg-pink text-btn-text-pink",
    "pink-border": "bg-pink-border text-btn-text-pink-border",
    purple: "bg-purple text-btn-text-purple",
    grayish: "bg-grayish",
    aqua: "bg-aqua text-btn-text-primary",
  };

  const variantClasses = variantStyles[variant] || variantStyles.primary;

  const classNameResult = classNames(
    variantClasses,
    `rounded-lg inline-flex justify-center items-center`,
    {
      "bg-opacity-100 border-white border-[1px]": variant === "secondary",
      "border-purple border-[1px]": variant === "pink-border",
      "!bg-disabled": disabled,
      "text-btn-text-disabled": disabled,
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
      "text-btn-text-primary": variant === "white",
    },
    className,
  );

  return (
    <button {...props} disabled={disabled} className={classNameResult} data-testid={dataTestId}>
      {children}
    </button>
  );
}
