import { CommunityAskQuestion } from "@/lib/ask/getCommunityAskList";
import { useQuery } from "@tanstack/react-query";

export function useCommunityAskListQuery() {
  return useQuery({
    queryKey: ["communityAskList"],
    queryFn: async (): Promise<{ askList: Array<CommunityAskQuestion> }> => {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/ask/");
      if (!response.ok) throw new Error("Error getting list");
      return await response.json();
    },
  });
}
