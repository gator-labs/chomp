import { cn } from "@/app/utils/tailwind";
import mysteryPrizeCreditsImage from "@/public/images/mystery-prize-credits.png";
import mysteryPrizeTokensImage from "@/public/images/mystery-prize-tokens.png";
import Image from "next/image";

import MysteryBoxAmount from "./MysteryBoxAmount";

export type MysteryBoxPrizeType = "credits" | "tokens";

type MysteryBoxPrizeProps = {
  type: MysteryBoxPrizeType;
  amount: number;
};

function MysteryBoxPrize({ type, amount }: MysteryBoxPrizeProps) {
  return (
    <div
      className={cn(
        "w-[117px] h-[142px] rounded-xl p-1 flex flex-col items-center justify-around",
        {
          "bg-chomp-blue-dark": type == "credits",
          "bg-chomp-orange-light": type == "tokens",
        },
      )}
    >
      <div className="bg-white rounded-2xl">
        <Image
          src={
            type == "credits"
              ? mysteryPrizeCreditsImage
              : mysteryPrizeTokensImage
          }
          alt={type == "credits" ? "Credits" : "Tokens"}
          title={type == "credits" ? "Credits" : "Tokens"}
          className="rounded-2xl w-[106px]"
        />
      </div>

      <MysteryBoxAmount
        type={type}
        amount={amount}
        units={type == "credits" ? "Credits" : "BONK"}
        className="w-full"
      />
    </div>
  );
}

export default MysteryBoxPrize;
