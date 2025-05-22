import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { getIsUserAdmin } from "@/app/queries/user";
import { unarchiveQuestion } from "@/lib/ask/unarchiveQuestion";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest } from "next/server";
import z from "zod";

const unarchiveSchema = z.object({
  questionId: z.number().int().gt(0).lte(Number.MAX_SAFE_INTEGER),
});

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
    req = unarchiveSchema.parse(data);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid request", exception: error }),
      {
        status: 500,
      },
    );
  }

  try {
    await unarchiveQuestion(req.questionId);
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        category: "admin",
      },
    });

    await Sentry.flush(SENTRY_FLUSH_WAIT);

    return new Response(
      JSON.stringify({ error: "Unable to complete action", excpetion: error }),
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
