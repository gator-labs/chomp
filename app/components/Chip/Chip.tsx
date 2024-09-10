import { cn } from "@/app/utils/tailwind";

interface Props {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

const Chip = ({ label, onClick, isActive }: Props) => {
  return (
    <li
      className={cn(
        "h-[29px] bg-gray-850 px-4 flex items-center justify-center rounded-[4px] text-gray-700 text-nowrap text-xs cursor-pointer",
        {
          "bg-gray-100 text-gray-950 border-[0.5px] border-gray-400": isActive,
        },
      )}
      onClick={onClick}
    >
      <p>{label}</p>
    </li>
  );
};

export default Chip;
