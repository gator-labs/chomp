import { useMutation } from "@tanstack/react-query";

export type AddToDeckParams = {
  questionId: number;
  deckId: "new-deck" | number;
  deckTitle?: string;
};

export function useCommunityAskAddToDeck() {
  return useMutation({
    mutationFn: async (params: AddToDeckParams): Promise<void> => {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/ask/", {
        method: "PATCH",
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error("Error making request");
    },
    mutationKey: ["communityAskAddToDeck"],
  });
}
