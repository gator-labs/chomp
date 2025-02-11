"use client";

import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

export type ViewRewardsButtonProps = {
  disabled?: boolean;
};

export default function ViewRewardsButton({
  disabled,
}: ViewRewardsButtonProps) {
  const router = useRouter();

  const goToRewardsPage = () => {
    router.push("/application/rewards");
  };

  return (
    <Button
      className={
        "text-sm font-semibold text-left flex items-center justify-center"
      }
      onClick={goToRewardsPage}
      disabled={!!disabled}
    >
      View Rewards
    </Button>
  );
}
