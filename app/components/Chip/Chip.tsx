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
        "h-[29px] bg-[#1B1B1B] px-4 flex items-center justify-center rounded-[4px] text-[#4D4D4D] text-nowrap text-xs cursor-pointer",
        {
          "bg-[#E6E6E6] text-[#0D0D0D] border-[0.5px] border-[#999999]":
            isActive,
        },
      )}
      onClick={onClick}
    >
      <p>{label}</p>
    </li>
  );
};

export default Chip;
