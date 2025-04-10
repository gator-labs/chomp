import classNames from "classnames";
import { forwardRef } from "react";

type TextInputLimitedProps = {
  variant: "primary" | "secondary" | "outline";
  currentLength: number;
  isError: boolean;
  limit: number;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextInputLimited = forwardRef<
  HTMLInputElement,
  TextInputLimitedProps
>(({ variant, currentLength, limit, isError, ...props }, ref) => {
  return (
    <div
      className={classNames(
        "flex items-center border-[1px] border-white rounded-md text-xs w-full text-input-gray",
        {
          "!border-gray-700 bg-black": variant === "outline" && !isError,
          "border-gray": variant === "secondary",
          "border-white": variant === "primary",
          "!border-destructive !text-destructive": isError,
        },
      )}
    >
      <input
        className="bg-black rounded-md w-full py-3 px-4 focus:outline-none"
        ref={ref}
        {...props}
      />
      {currentLength > 0 && (
        <span
          className={classNames("pr-3", {
            "text-destructive": isError || currentLength > limit,
          })}
        >
          {currentLength}/{limit}
        </span>
      )}
    </div>
  );
});

TextInputLimited.displayName = "TextInputLimited";
