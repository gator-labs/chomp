import { useMutation } from "@tanstack/react-query";

export type RepairUserStreakParams = {
  wallet: string;
  date: string;
  reason: string;
};

export type RepairGlobalStreakParams = {
  date: string;
  reason: string;
};

export type RepairStreakResult = {
  oldStreak: number;
  newStreak: number;
};

export function useRepairUserStreak() {
  return useMutation({
    mutationFn: async (
      params: RepairUserStreakParams | RepairGlobalStreakParams,
    ): Promise<RepairStreakResult> => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/streak",
        {
          method: "PATCH",
          body: JSON.stringify(params),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error making request");
      }

      return await response.json();
    },
    mutationKey: ["repairUserStreak"],
  });
}
