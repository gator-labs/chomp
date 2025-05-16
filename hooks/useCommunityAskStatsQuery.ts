import { CommunityAskPeriodStats } from "@/lib/ask/getCommunityAskStats";
import { useQuery } from "@tanstack/react-query";

export function useCommunityAskStatsQuery() {
  return useQuery({
    queryKey: ["communityAskStats"],
    queryFn: async (): Promise<{ stats: CommunityAskPeriodStats }> => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/ask/stats",
      );
      if (!response.ok) throw new Error("Error getting stats");
      return await response.json();
    },
  });
}
