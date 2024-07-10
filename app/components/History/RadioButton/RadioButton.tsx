import { cn } from "@/app/utils/tailwind";
import { InputHTMLAttributes } from "react";

interface RadioButtonProps extends InputHTMLAttributes<HTMLInputElement> {
  text: string;
}

export default function RadioButton({
  text,
  value,
  checked,
  onChange,
}: RadioButtonProps) {
  return (
    <div className="flex items-center">
      <input
        id="default-radio-1"
        type="radio"
        value={value}
        name="default-radio"
        className={cn(
          "appearance-none w-6 h-6 border-2 rounded-[40px] border-[#999999] bg-[#FFFFFF]",
          {
            "border-[#CFC5F7]": checked,
          },
        )}
        onChange={onChange}
        checked={checked}
      />
      {checked && (
        <div className="absolute w-4 h-4 rounded-full bg-[#A3A3EC] ml-1" />
      )}
      <label className="ms-2 text-sm font-sora font-light text-[#FFFFFF]">
        {text}
      </label>
    </div>
  );
}
