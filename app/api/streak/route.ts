import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { getIsUserAdmin } from "@/app/queries/user";
import { getUserStreak } from "@/lib/streaks/getUserStreak";
import { repairAllStreaks, repairUserStreak } from "@/lib/streaks/repairStreak";
import { getWalletOwner } from "@/lib/wallet";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest } from "next/server";
import z from "zod";

const repairStreakSchema = z.object({
  wallet: z.string().trim().min(1).optional(),
  date: z.coerce.date(),
  reason: z.string().trim(),
});

export async function GET(request: NextRequest) {
  const payload = await getJwtPayload();

  const searchParams = request.nextUrl.searchParams;

  if (!payload?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    return new Response(
      JSON.stringify({
        error: "You are not authorized to perform this action.",
      }),
      { status: 403 },
    );
  }

  let params;

  try {
    params = Object.fromEntries(searchParams.entries());
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid request", exception: error }),
      {
        status: 500,
      },
    );
  }

  const userId = await getWalletOwner(params.wallet);

  if (!userId) throw new Error("User not found");

  const streak = await getUserStreak(userId);

  return new Response(
    JSON.stringify({
      streak,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function PATCH(request: NextRequest) {
  const payload = await getJwtPayload();

  if (!payload?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    return new Response(
      JSON.stringify({
        error: "You are not authorized to perform this action.",
      }),
      { status: 403 },
    );
  }

  let req;

  try {
    const data = await request.json();
    req = repairStreakSchema.parse(data);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid request", exception: error }),
      {
        status: 500,
      },
    );
  }

  try {
    if (!req.wallet) await repairAllStreaks(req.date, req.reason);
    else {
      const userId = await getWalletOwner(req.wallet);

      if (!userId) throw new Error("User not found");
      await repairUserStreak(userId, req.date, req.reason);
    }
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        category: "admin",
      },
    });

    await Sentry.flush(SENTRY_FLUSH_WAIT);

    return new Response(
      JSON.stringify({ error: "Unable to complete action", exception: error }),
      {
        status: 500,
      },
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
