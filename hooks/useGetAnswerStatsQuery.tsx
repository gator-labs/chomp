import { AnswerStats } from "@/types/answerStats";
import { useQuery } from "@tanstack/react-query";

export function useGetAnswerStatsQuery(questionId: number | undefined) {
  return useQuery({
    queryKey: ["getAnswer", questionId],
    queryFn: async (): Promise<{ stats: AnswerStats }> => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL +
          "/answer-stats/?questionId=" +
          questionId,
      );
      if (!response.ok) throw new Error("Error getting stats");
      const result = await response.json();
      return result;
    },
    enabled: !!questionId,
  });
}
