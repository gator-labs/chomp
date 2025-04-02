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
  Streaks: <CalendarCheckIcon color="black" />,
  Validation: <MoneyOutlineIcon color="black" />,
  Practice: <LabelIcon color="black" />,
  Campaign: <FlagOutlineIcon color="black" />,
};

const STYLES: Record<EMysteryBoxCategory, string> = {
  Streaks: "bg-chomp-yellow-pale",
  Validation: "bg-chomp-yellow-light",
  Practice: "bg-chomp-blue-light",
  Campaign: "bg-chomp-pink-light",
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
          "flex items-center flex-row justify-center gap-1 ",
          `${disabled ? "text-gray-700" : "text-black"}`,
        )}
      >
        {LABELS[category]}{" "}
        {disabled ? DISABLEDICONS[category] : ICONS[category]}
      </span>
    </span>
  );
}

export default MysteryBoxCategoryPill;
