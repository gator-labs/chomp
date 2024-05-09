import { getDailyDeckFormattedString } from "@/app/utils/dateUtils";

type DailyDeckTitleProps = {
  date: Date;
};

export function DailyDeckTitle({ date }: DailyDeckTitleProps) {
  return (
    <div className="text-sm font-sora">
      <span className="font-light">Daily deck</span> -{" "}
      <span className="font-bold">{getDailyDeckFormattedString(date)}</span>
    </div>
  );
}
