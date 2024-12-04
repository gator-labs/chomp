import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { cn } from "@/app/utils/tailwind";

import { MysteryBoxPrizeType } from "./MysteryBoxPrize";

type MysteryBoxAmountProps = {
  type: MysteryBoxPrizeType;
  amount: number;
  units?: string;
  className?: string;
};

function MysteryBoxAmount({
  type,
  amount,
  units,
  className,
}: MysteryBoxAmountProps) {
  return (
    <div
      className={cn(
        "text-xs font-bold p-1 px-3 rounded-[2em] flex items-center justify-center text-center",
        className,
        {
          "bg-chomp-blue-light text-black font-bold": type == "credits",
          "bg-chomp-orange-dark": type == "tokens",
        },
      )}
    >
      {numberToCurrencyFormatter.format(amount)} {units ?? ""}
    </div>
  );
}

export default MysteryBoxAmount;
