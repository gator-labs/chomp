export type RadioButtonProps = {
  value: string;
  checked: boolean;
  text: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Specify the correct type for the onChange event handler
};

export default function RadioButton({
  value,
  checked,
  text,
  onChange,
}: RadioButtonProps) {
  return (
    <div className="flex items-center">
      <input
        id="default-radio-1"
        type="radio"
        value={value}
        name="default-radio"
        className="w-4 h-4 text-[#A3A3EC] bg-gray-100 border-gray-300 focus:ring-[#CFC5F7] dark:focus:ring-[#A3A3EC] dark:ring-[#A3A3EC focus:ring-2 dark:ring-[#A3A3EC dark:ring-[#A3A3EC"
        onChange={onChange}
        checked={checked}
      />
      <label className="ms-2 text-sm font-sora font-light text-[#FFFFFF]">
        {text}
      </label>
    </div>
  );
}
