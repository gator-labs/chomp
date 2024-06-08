import { getDailyDeck } from "@chomp/app/queries/deck";
import { redirect } from "next/navigation";

export const DailyDeckRedirect = async () => {
  const dailyDeck = await getDailyDeck();

  if (dailyDeck && dailyDeck.questions.length > 0) {
    redirect("/daily-deck");
  }

  return null;
};
