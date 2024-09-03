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
        "h-[29px] bg-grey-850 px-4 flex items-center justify-center rounded-[4px] text-grey-700 text-nowrap text-xs cursor-pointer",
        {
          "bg-grey-100 text-grey-950 border-[0.5px] border-grey-400": isActive,
        },
      )}
      onClick={onClick}
    >
      <p>{label}</p>
    </li>
  );
};

export default Chip;
