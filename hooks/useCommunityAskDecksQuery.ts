import { CommunityAskDeck } from "@/types/ask";
import { useQuery } from "@tanstack/react-query";

export function useCommunityAskDecksQuery() {
  return useQuery({
    queryKey: ["communityAskDecks"],
    queryFn: async (): Promise<{ decks: Array<CommunityAskDeck> }> => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/ask/decks",
      );
      if (!response.ok) throw new Error("Error getting decks");
      return await response.json();
    },
  });
}
