import { getDailyDeck } from "@/app/queries/deck";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const DailyDeckRedirect = async () => {
  const dailyDeck = await getDailyDeck();
  const headersList = headers();
  const pathname = headersList.get("x-path") || "";

  // enables direct link to the deck without redirecting to the daily deck
  if (pathname.includes("/decks")) {
    console.log('pathname includes "/decks"');
    return null;
  }

  if (
    dailyDeck &&
    dailyDeck.questions.length > 0 &&
    dailyDeck?.questions.every((q) => q.status === undefined) &&
    pathname !== "/daily-deck"
  ) {
    redirect("/daily-deck");
  }

  return null;
};
