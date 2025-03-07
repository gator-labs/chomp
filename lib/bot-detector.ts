const API_TIMEOUT = 5 * 60 * 1000; // Five minutes

export type BotDetectorResponse = {
  start_date: string;
  end_date: string;
  mean_bot_score: Record<string, number>;
};

export const queryBotDetector = async (): Promise<BotDetectorResponse> => {
  if (!process.env.MECHANISM_ENGINE_URL)
    throw new Error("MECHANISM_ENGINE_URL not defined");

  const response = await fetch(
    process.env.MECHANISM_ENGINE_URL + "/api/chomp/bot-detector",
    { signal: AbortSignal.timeout(API_TIMEOUT) },
  );

  if (!response.ok)
    throw new Error(
      `Mechanism engine bot detector returned error: ${response.status}: ${response.statusText}`,
    );

  const results = await response.json();

  if (!("mean_bot_score" in results) || !results["mean_bot_score"])
    throw new Error("Missing field in bot detector API results");

  return results;
};
