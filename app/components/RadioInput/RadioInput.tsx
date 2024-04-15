import classNames from "classnames";

type RadioInputProps = {
  name: string;
  options: { label: string; value: string }[];
  onOptionSelected: (value: string) => void;
  value?: string;
};

export function RadioInput({
  name,
  onOptionSelected,
  options,
  value,
}: RadioInputProps) {
  return (
    <div>
      {options.map((o, index) => (
        <div key={index} className="[&:not(:first-of-type)]:mt-2">
          <button
            onClick={() => onOptionSelected(o.value)}
            className="flex items-center space-x-2"
          >
            <div
              className={classNames(
                "w-6 h-6 rounded-full bg-[#999] flex items-center justify-center",
                { "!bg-aqua": value === o.value },
              )}
            >
              <div
                className={classNames("w-5 h-5 rounded-full", {
                  "bg-aqua border-2 border-white": value === o.value,
                  "bg-white": value !== o.value,
                })}
              ></div>
            </div>
            <div className="text-sm font-sora font-light text-white">
              {o.label}
            </div>
          </button>
          <input type="radio" name={name} value={o.value} className="hidden" />
        </div>
      ))}
    </div>
  );
}
