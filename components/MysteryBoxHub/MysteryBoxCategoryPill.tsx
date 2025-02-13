import { DisabledMoneyOutlineIcon } from "@/app/components/Icons/DisabledMoneyOutlineIcon";
import { cn } from "@/app/utils/tailwind";
import { EMysteryBoxCategory } from "@/types/mysteryBox";

import { CalendarCheckIcon } from "../../app/components/Icons/CalendarCheckIcon";
import { FlagOutlineIcon } from "../../app/components/Icons/FlagOutlineIcon";
import { LabelIcon } from "../../app/components/Icons/LabelIcon";
import { MoneyOutlineIcon } from "../../app/components/Icons/MoneyOutlineIcon";

type MysteryBoxCategoryPillProps = {
  category: EMysteryBoxCategory;
  disabled?: boolean;
};

const LABELS: Record<EMysteryBoxCategory, string> = {
  Streaks: "Streaks",
  Validation: "Validation Rewards",
  Practice: "Practice Decks",
  Campaign: "Campaign",
};

const DISABLEDICONS: Record<EMysteryBoxCategory, any> = {
  Streaks: <CalendarCheckIcon />,
  Validation: <DisabledMoneyOutlineIcon />,
  Practice: <LabelIcon />,
  Campaign: <FlagOutlineIcon />,
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

function MysteryBoxCategoryPill({
  category,
  disabled,
}: MysteryBoxCategoryPillProps) {
  return (
    <span
      className={cn(
        "rounded-full align-middle px-3 md:px-4 py-1 flex items-center justify-center gap-1 text-xs md:text-sm",
        `${disabled ? "bg-gray-400" : STYLES[category]}`,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center gap-1 ",
          `${disabled ? "text-gray-700" : ""}`,
        )}
      >
        {LABELS[category]}{" "}
        {disabled ? DISABLEDICONS[category] : ICONS[category]}
      </span>
    </span>
  );
}

export default MysteryBoxCategoryPill;
