"use client";

import { STACKS_PATH } from "@/lib/urls";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../Icons/ArrowLeftIcon";

interface StacksHeaderProps {
  heading?: string;
  backAction: "back" | "stacks";
}

const StacksHeader: React.FC<StacksHeaderProps> = ({
  heading,
  backAction = "back",
}) => {
  const router = useRouter();

  const handleBack = () =>
    backAction === "back" ? router.back() : router.push(`${STACKS_PATH}`);

  return (
    <header className="flex items-center gap-2">
      <div className="cursor-pointer" onClick={handleBack}>
        <ArrowLeftIcon />
      </div>
      {heading && <h2 className="text-xl font-bold text-white">{heading}</h2>}
    </header>
  );
};

export default StacksHeader;
