import { useMutation } from "@tanstack/react-query";

export function useCommunityAskUnarchive() {
  return useMutation({
    mutationFn: async (questionId: number): Promise<void> => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/ask/unarchive",
        {
          method: "PATCH",
          body: JSON.stringify({ questionId }),
        },
      );
      if (!response.ok) throw new Error("Error making request");
    },
    mutationKey: ["communityAskUnarchive"],
  });
}
