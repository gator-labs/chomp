import { getJwtPayload } from "@/app/actions/jwt";
import { getIsUserAdmin } from "@/app/queries/user";
import { addToCommunityDeck } from "@/lib/ask/addToCommunityDeck";
import { getCommunityAskList } from "@/lib/ask/getCommunityAskList";
import { type NextRequest } from "next/server";
import z from "zod";

const addToDeckSchema = z.object({
  questionId: z.number().int().gt(0).lte(Number.MAX_SAFE_INTEGER),
});

export async function GET() {
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

  const askList = await getCommunityAskList();

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

  let req;

  try {
    const data = await request.json();
    req = addToDeckSchema.parse(data);
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request", exception: error }), {
      status: 500,
    });
  }

  try {
    await addToCommunityDeck(req.questionId);
  } catch (error) {
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
