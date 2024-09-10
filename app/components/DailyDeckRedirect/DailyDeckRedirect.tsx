import { getDailyDeck } from "@/app/queries/deck";
import { redirect } from "next/navigation";

export const DailyDeckRedirect = async () => {
  const dailyDeck = await getDailyDeck();

  if (dailyDeck && dailyDeck.questions.length > 0 && dailyDeck.questions.filter((q) => q.status === undefined).length === dailyDeck.questions.length) {
    redirect("/daily-deck");
  }

  return null;
};
