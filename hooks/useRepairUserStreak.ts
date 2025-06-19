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
      if (!response.ok) throw new Error("Error making request");

      return await response.json();
    },
    mutationKey: ["repairUserStreak"],
  });
}
