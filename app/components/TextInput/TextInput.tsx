import classNames from "classnames";
import { forwardRef } from "react";

type TextInputProps = {
  variant: "primary" | "secondary";
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ variant, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={classNames(
          "border-[1px] border-grey-0 py-3 px-4 focus:border-aqua focus:outline-none focus:shadow-input focus:shadow-[#6DECAFCC] rounded-md text-xs w-full text-input-gray",
          {
            "border-gray": variant === "secondary",
            "border-grey-0": variant === "primary",
          },
        )}
      />
    );
  },
);

TextInput.displayName = "TextInput";
