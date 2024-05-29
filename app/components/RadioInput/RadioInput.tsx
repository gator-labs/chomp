import classNames from "classnames";
import { OPTION_LABEL } from "./constants";

type RadioInputProps = {
  name: string;
  options: { label: string; value: string; id: number }[];
  onOptionSelected: (value: string) => void;
  value?: string;
  randomOptionPercentage?: number;
  randomOptionId?: number;
};

export function RadioInput({
  name,
  onOptionSelected,
  options,
  value,
  randomOptionPercentage,
  randomOptionId,
}: RadioInputProps) {
  return (
    <div>
      {options.map((o, index) => (
        <div key={index} className="[&:not(:first-of-type)]:mt-4 relative">
          <button
            type="button"
            onClick={() => onOptionSelected(o.value)}
            className="flex items-center space-x-2 gap-[14px] h-10 w-full"
          >
            <div
              className={classNames(
                "h-full w-10 bg-[#4D4D4D] rounded-lg flex items-center justify-center",
                {
                  "!bg-purple": value === o.value,
                },
              )}
            >
              <p
                className={classNames("text-sm font-bold text-white", {
                  "!text-btn-text-primary": value === o.value,
                })}
              >
                {OPTION_LABEL[index as keyof typeof OPTION_LABEL]}
              </p>
            </div>
            <div className="text-sm font-sora font-light text-white h-full px-4 border-[#666666] border-[1px] rounded-lg flex items-center flex-1 !m-0 relative overflow-hidden">
              {randomOptionId === o.id && (
                <div
                  className="absolute bg-purple h-full left-0 -z-10"
                  style={{ width: `${randomOptionPercentage}%` }}
                />
              )}
              {o.label}
            </div>
          </button>
          <input type="radio" name={name} value={o.value} className="hidden" />
        </div>
      ))}
    </div>
  );
}
