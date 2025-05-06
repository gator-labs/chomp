import { main as findUnsuccessfulPrizes } from "@/scripts/mystery-box/mystery-box-find-unsuccessful-prizes";
import { main as resultsCleanFalsePositives } from "@/scripts/mystery-box/results-clean-false-positives";
import * as Sentry from "@sentry/nextjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { readFileSync } from "node:fs";

dayjs.extend(utc);

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET || "";

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const startOfDayUTCMinusOneHour = dayjs()
    .utc()
    .startOf("day")
    .subtract(1, "hour")
    .toDate()
    .toISOString();
  const resFindFilePath = await findUnsuccessfulPrizes(
    startOfDayUTCMinusOneHour,
  );

  const resCleanFilePath = await resultsCleanFalsePositives(resFindFilePath);

  const fileTxt = readFileSync(resCleanFilePath, { encoding: "utf8" });
  const fileTxtRowsLength = fileTxt
    .split(/\n/)
    .filter((line) => line.trim() !== "").length;

  if (fileTxtRowsLength > 1) {
    Sentry.getCurrentScope().addAttachment({
      filename: `problematic-prizes-${new Date().toISOString().replace(/:/g, "-")}.csv`,
      data: fileTxt,
      contentType: "text/csv",
    });

    Sentry.captureMessage(
      `Found problematic MysteryBoxPrizes PLEASE CHECK - ${dayjs().utc().format("YYYY-MM-DD HH:mm:ss")} UTC`,
      {
        level: "error",
        tags: {
          category: "mystery-box-prizes-error-owned",
        },
        extra: {
          instructions:
            "Please download the attached CSV and follow the instructions in scripts/mystery-box/README.md to pay the owned users",
        },
      },
    );
  } else {
    Sentry.captureMessage("Not found problematic MysteryBoxPrizes today :)");
  }

  await Sentry.flush(20000);

  Sentry.getCurrentScope().clearAttachments();

  // Return a successful response
  return new Response(
    JSON.stringify({
      status: "success",
      message: "Successfully processed unsuccessful prizes",
      reportGenerated: true,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
