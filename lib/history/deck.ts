import { HISTORY_DECK_LIMIT } from "@/app/constants/decks";
import {
  getAnsweredDecksForHistory,
  getDecksForHistory,
} from "@/app/queries/history";
import { DeckHistoryItem } from "@/types/history";
import "server-only";

export const getHistoryDecks = async ({
  pageParam,
  showAnsweredDeck,
  userId,
}: {
  pageParam: number;
  showAnsweredDeck: boolean;
  userId: string | undefined;
}): Promise<DeckHistoryItem[]> => {
  if (!userId) {
    return [];
  }
  if (showAnsweredDeck) {
    return getAnsweredDecksForHistory(
      "1078fe24-4c96-4676-8b7f-7d1d4d611ac3",
      HISTORY_DECK_LIMIT,
      pageParam,
    );
  } else {
    return getDecksForHistory(userId, HISTORY_DECK_LIMIT, pageParam);
  }
};
