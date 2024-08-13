import { cn } from "@/app/utils/tailwind";

interface Props {
  isActive: boolean;
  className?: string;
}

const ActiveIndicator = ({ isActive, className }: Props) => {
  return (
    <div
      className={cn(
        "w-2.5 h-2.5 rounded-full border-[1px] border-[#333333] absolute top-0 left-0 z-[1]",
        {
          "bg-aqua": isActive,
          "bg-warning": !isActive,
        },
        className,
      )}
    />
  );
};

export default ActiveIndicator;
