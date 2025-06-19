import { Streak } from "@/lib/streaks/getUserStreak";
import { useQuery } from "@tanstack/react-query";

export function useGetUserStreakQuery(wallet: string) {
  return useQuery({
    queryKey: ["getUserStreak", wallet],
    queryFn: async (): Promise<{ streak: Streak | null }> => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/streak?wallet=" + wallet,
      );
      if (!response.ok) {
        throw new Error("Error getting streak");
      }
      const result = await response.json();
      return result;
    },
    enabled: false,
  });
}
