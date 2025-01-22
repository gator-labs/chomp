import prisma from "@/app/services/prisma";
import { processCreditsTransaction } from "@/lib/credits/processCreditsTransaction";
import { EChainTxStatus } from "@prisma/client";
import { startOfDay, sub } from "date-fns";

/**
 * This API processes pending credit purchase transactions that fall within
 * the 1 week to 10 minutes before the current time.
 *
 * Actions performed:
 * 1. Attempts to validate the payment transaction hash
 * 2. If successful, marks the chainTx as `finalized` and adds credits to user
 * 3. If unsuccessful, logs error to Sentry
 */

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET || "";

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const currentTime = new Date();
  const weekAgo = sub(currentTime, { days: 7 });
  const tenMinutesAgo = sub(currentTime, { minutes: 10 });

  try {
    // Fetch all new transactions within specific date range
    const pendingTransactions = await prisma.chainTx.findMany({
      take: 10,
      where: {
        status: EChainTxStatus.New,
        createdAt: {
          gte: startOfDay(weekAgo),
          lte: tenMinutesAgo,
        },
        failedAt: null,
      },
    });

    // Process transactions
    const results = await Promise.all(
      pendingTransactions.map((tx) => processCreditsTransaction(tx)),
    );

    const stats = {
      total: pendingTransactions.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };

    return new Response(
      JSON.stringify({
        message: "Processing completed",
        stats,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Database error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
