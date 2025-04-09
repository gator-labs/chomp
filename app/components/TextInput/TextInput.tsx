import classNames from "classnames";
import { forwardRef } from "react";

type TextInputProps = {
  variant: "primary" | "secondary" | "outline";
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ variant, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={classNames(
          "border-[1px] border-white py-3 px-4 focus:border-aqua focus:outline-none focus:shadow-input focus:shadow-[#6DECAFCC] rounded-md text-xs w-full text-input-gray",
          {
            "border-gray-700 bg-black": variant === "outline",
            "border-gray": variant === "secondary",
            "border-white": variant === "primary",
          },
        )}
      />
    );
  },
);

TextInput.displayName = "TextInput";
