import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { getIsUserAdmin } from "@/app/queries/user";
import { acquireMutex } from "@/app/utils/mutex";
import { addToCommunityDeck } from "@/lib/ask/addToCommunityDeck";
import { getCommunityAskList } from "@/lib/ask/getCommunityAskList";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest } from "next/server";
import z from "zod";

const addToDeckSchema = z.object({
  questionId: z.number().int().gt(0).lte(Number.MAX_SAFE_INTEGER),
});

const filterListQuerySchema = z.object({
  filter: z.union([
    z.literal("pending"),
    z.literal("accepted"),
    z.literal("archived"),
  ]),
  sortBy: z.union([z.literal("createdAt"), z.literal("userId")]),
  sortOrder: z.union([z.literal("asc"), z.literal("desc")]),
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

  let req;

  try {
    const params = Object.fromEntries(searchParams.entries());
    req = filterListQuerySchema.parse(params);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid request", exception: error }),
      {
        status: 500,
      },
    );
  }

  const askList = await getCommunityAskList(
    req.filter,
    req.sortBy,
    req.sortOrder,
  );

  return new Response(
    JSON.stringify({
      askList,
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

  const release = await acquireMutex({
    identifier: "API_ADD_TO_COMMUNITY_DECK",
    data: {},
  });

  let req;

  try {
    const data = await request.json();
    req = addToDeckSchema.parse(data);
  } catch (error) {
    release();
    return new Response(
      JSON.stringify({ error: "Invalid request", exception: error }),
      {
        status: 500,
      },
    );
  }

  try {
    await addToCommunityDeck(req.questionId);
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
  } finally {
    release();
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
