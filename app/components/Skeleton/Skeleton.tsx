import { cn } from "@/app/utils/tailwind";

interface Props {
  className?: string;
}

const Skeleton = ({ className }: Props) => {
  return (
    <div
      className={cn(
        "border-gray-600 border-[0.5px] rounded-lg w-full animate-pulse h-[120px] shrink-0 overflow-hidden",
        className,
      )}
    >
      <div className="bg-gray-800 flex space-x-4 h-full"></div>
    </div>
  );
};

export default Skeleton;
