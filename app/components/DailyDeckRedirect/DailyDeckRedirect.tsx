import { getDailyDeck } from "@/app/queries/deck";
import { redirect } from "next/navigation";

export const DailyDeckRedirect = async () => {
  const dailyDeck = await getDailyDeck();
  
  if (dailyDeck && dailyDeck.questions.length > 0 && dailyDeck?.questions.every((q) => q.status === undefined)) {
    redirect("/daily-deck");
  }

  return null;
};
