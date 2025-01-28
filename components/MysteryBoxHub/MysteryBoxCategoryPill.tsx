import { cn } from "@/app/utils/tailwind";
import { EMysteryBoxCategory } from "@/types/mysteryBox";

import { CalendarCheckIcon } from "../../app/components/Icons/CalendarCheckIcon";
import { FlagOutlineIcon } from "../../app/components/Icons/FlagOutlineIcon";
import { LabelIcon } from "../../app/components/Icons/LabelIcon";
import { MoneyOutlineIcon } from "../../app/components/Icons/MoneyOutlineIcon";

type MysteryBoxCategoryPillProps = {
  category: EMysteryBoxCategory;
};

const LABELS: Record<EMysteryBoxCategory, string> = {
  Streaks: "Streaks",
  Validation: "Validation Rewards",
  Practice: "Practice Decks",
  Campaign: "Campaign",
};

const ICONS: Record<EMysteryBoxCategory, any> = {
  Streaks: <CalendarCheckIcon />,
  Validation: <MoneyOutlineIcon />,
  Practice: <LabelIcon />,
  Campaign: <FlagOutlineIcon />,
};

const STYLES: Record<EMysteryBoxCategory, string> = {
  Streaks: "bg-chomp-yellow-pale text-black",
  Validation: "bg-chomp-orange-dark text-white",
  Practice: "bg-chomp-green-light text-black",
  Campaign: "bg-chomp-blue-light text-black",
};

function MysteryBoxCategoryPill({ category }: MysteryBoxCategoryPillProps) {
  return (
    <span
      className={cn(
        "rounded-full align-middle px-4 py-1 flex items-center justify-center gap-1 text-sm",
        STYLES[category],
      )}
    >
      <span>{LABELS[category]}</span> {ICONS[category]}
    </span>
  );
}

export default MysteryBoxCategoryPill;
