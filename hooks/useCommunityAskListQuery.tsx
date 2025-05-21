import { CommunityAskQuestion } from "@/lib/ask/getCommunityAskList";
import { useQuery } from "@tanstack/react-query";

import { CommunityAskFilter } from '@/types/ask';

export function useCommunityAskListQuery(filter: CommunityAskFilter) {
  return useQuery({
    queryKey: ["communityAskList", filter],
    queryFn: async (): Promise<{ askList: Array<CommunityAskQuestion> }> => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/ask?filter=" + filter,
      );
      if (!response.ok) throw new Error("Error getting list");
      return await response.json();
    },
  });
}
