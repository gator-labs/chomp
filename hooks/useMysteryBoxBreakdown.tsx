import { MysteryBoxBreakdown } from "@/types/mysteryBox";
import { useQuery } from "@tanstack/react-query";

export function useMysteryBoxBreakdown(mysteryBoxId: string | undefined) {
  return useQuery({
    queryKey: ["mysteryBoxBreakdown", mysteryBoxId],
    queryFn: async (): Promise<{ breakdown: Array<MysteryBoxBreakdown> }> => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL +
          "/mystery-box/breakdown?id=" +
          mysteryBoxId,
      );
      if (!response.ok) throw new Error("Error getting breakdown");
      return await response.json();
    },
    enabled: !!mysteryBoxId,
  });
}
