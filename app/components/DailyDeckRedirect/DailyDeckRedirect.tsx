import { redirect } from "next/navigation";
import { getDailyDeck } from "@/app/queries/deck";

export const DailyDeckRedirect = async () => {
  const dailyDeck = await getDailyDeck();

  if (dailyDeck) {
    redirect("/daily-deck");
  }

  return null;
};
