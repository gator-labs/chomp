import classNames from "classnames";
import { ReactNode } from "react";

type ButtonProps = {
  variant: "primary" | "secondary" | "warning" | "white" | "black";
  onClick: () => void;
  size?: "big" | "normal";
  isDisabled?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "secondary",
  size = "normal",
  onClick,
  isDisabled = false,
  children,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        `bg-${variant} text-btn-text-${variant} rounded-lg w-full px-4`,
        {
          "bg-opacity-100 border-white border-[1px]": variant === "secondary",
          "!bg-disabled": isDisabled,
          "!text-btn-text-disabled": isDisabled,
          "cursor-default": isDisabled,
          "py-4": size === "normal",
          "py-6": size === "big",
          "font-semibold": size === "normal",
          "font-bold": size === "big",
          "text-sm": size === "normal",
          "text-base": size === "big",
        }
      )}
    >
      {children}
    </button>
  );
}
