import classNames from "classnames";

type TextInputProps = {
  variant: "primary" | "secondary";
} & React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ variant, ...props }: TextInputProps) {
  return (
    <input
      {...props}
      className={classNames(
        "uppercase border-[1px] border-border-white py-3 px-4 focus:border-aqua focus:outline-none focus:shadow-input focus:shadow-[#6DECAFCC] rounded-md text-xs w-full text-input-gray",
        {
          "border-gray": variant === "secondary",
          "border-border-white": variant === "primary",
        }
      )}
    />
  );
}
