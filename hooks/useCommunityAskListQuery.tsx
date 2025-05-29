import { CommunityAskQuestion } from "@/lib/ask/getCommunityAskList";
import { CommunityAskFilter, CommunityAskSortBy, SortOrder } from "@/types/ask";
import { useQuery } from "@tanstack/react-query";

export function useCommunityAskListQuery(
  filter: CommunityAskFilter,
  sortBy: CommunityAskSortBy,
  sortOrder: SortOrder,
) {
  return useQuery({
    queryKey: ["communityAskList", filter, sortBy, sortOrder],
    queryFn: async (): Promise<{ askList: Array<CommunityAskQuestion> }> => {
      const params = [
        "filter=" + filter,
        "sortBy=" + sortBy,
        "sortOrder=" + sortOrder,
      ].join("&");

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/ask?" + params,
      );
      if (!response.ok) throw new Error("Error getting list");
      return await response.json();
    },
  });
}
