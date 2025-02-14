import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { tryAcquireMutex } from "@/app/utils/mutex";
import { updateBots } from "@/lib/bots";
import * as Sentry from "@sentry/nextjs";

const API_TIMEOUT = 5 * 60 * 1000; // Five minutes

/**
 * Looks for questions that are revealing soon and submits
 * them to the bot analysis API, marking any bots that are
 * returned from the API as bots in the database.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET || "";

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const release = await tryAcquireMutex({
    identifier: "DETECT_BOT_ACTIVITY",
    data: {},
  });

  if (release === null) {
    return new Response(
      JSON.stringify({
        message: "Activity analysis already in progress",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
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

    const scores: Record<string, number> = results["mean_bot_score"];
    const botUserIds = Object.keys(scores);

    await updateBots(
      botUserIds,
      new Date(results.start_date),
      new Date(results.end_date),
    );

    return new Response(
      JSON.stringify({
        message: "Analysis completed",
        botCount: botUserIds.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        category: "bot-detector",
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);

    return new Response("Internal Server Error", { status: 500 });
  } finally {
    release();
  }
}
