"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../Icons/ArrowLeftIcon";

interface CampaignsHeaderProps {
  heading?: string; 
  backAction: "back" | "campaigns";
}

const CampaignsHeader: React.FC<CampaignsHeaderProps> = ({
  heading,
  backAction = "back", 
}) => {
  const router = useRouter();

  const handleBack = () => 
    backAction === "back" ? router.back() : router.push("/stacks");

  return (
    <header className="flex items-center gap-2">
      <div className="cursor-pointer" onClick={handleBack}>
        <ArrowLeftIcon />
      </div>
      {heading && <h2 className="text-xl font-bold text-white">{heading}</h2>}
    </header>
  );
};

export default CampaignsHeader;
