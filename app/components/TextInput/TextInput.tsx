import classNames from "classnames";

type TextInputProps = {
  name?: string;
  onChange: () => string;
  value: string;
  variant: "primary" | "secondary";
};

export function TextInput({ onChange, value, name, variant }: TextInputProps) {
  return (
    <input
      onChange={onChange}
      value={value}
      name={name}
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
