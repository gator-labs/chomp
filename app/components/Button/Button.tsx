import classNames from "classnames";
import { ReactNode } from "react";

type ButtonProps = {
  variant: "primary" | "secondary" | "warning" | "white" | "black";
  onClick: () => void;
  size?: "big" | "normal" | "small";
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
        `bg-${variant} text-btn-text-${variant} rounded-lg w-full px-4 inline-flex justify-center`,
        {
          "bg-opacity-100 border-white border-[1px]": variant === "secondary",
          "!bg-disabled": isDisabled,
          "!text-btn-text-disabled": isDisabled,
          "cursor-default": isDisabled,
          "py-2": size === "small",
          "py-4": size === "normal",
          "py-6": size === "big",
          "font-semibold": size === "normal" || size === "small",
          "font-bold": size === "big",
          "text-sm": size === "normal" || size === "small",
          "text-base": size === "big",
        }
      )}
    >
      {children}
    </button>
  );
}
