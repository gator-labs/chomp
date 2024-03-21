import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import classNames from "classnames";
import { ReactNode } from "react";

type ButtonProps = {
  variant?: "primary" | "secondary" | "warning" | "white" | "black";
  size?: "big" | "normal" | "small";
  isDisabled?: boolean;
  children: ReactNode;
  dynamic?: boolean;
  isFullWidth?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "secondary",
  size = "normal",
  isDisabled = false,
  children,
  dynamic,
  isFullWidth = true,
  className,
  ...props
}: ButtonProps) {
  const classNameResult = classNames(
    `bg-${variant} text-btn-text-${variant} rounded-lg inline-flex justify-center`,
    {
      "bg-opacity-100 border-white border-[1px]": variant === "secondary",
      "!bg-disabled": isDisabled,
      "!text-btn-text-disabled": isDisabled,
      "cursor-default": isDisabled,
      "py-2 px-4": size === "small",
      "py-4 px-8": size === "normal",
      "py-4 px-16": size === "big",
      "rounded-2xl": size === "big",
      "font-semibold": size === "normal" || size === "small",
      "font-bold": size === "big",
      "text-sm": size === "normal" || size === "small",
      "text-base": size === "big",
      "w-full": isFullWidth,
    },
    className
  );

  if (dynamic) {
    return (
      <DynamicConnectButton buttonClassName={classNameResult}>
        {children}
      </DynamicConnectButton>
    );
  }

  return (
    <button {...props} className={classNameResult}>
      {children}
    </button>
  );
}
