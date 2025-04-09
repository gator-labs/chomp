import { getJwtPayload } from "@/app/actions/jwt";
import { getAnswerStats } from "@/lib/answerStats/getStats";
import { type NextRequest } from "next/server";
import z from "zod";

const schema = z.object({
  questionId: z.string().transform((v) => parseInt(v)),
});

export async function GET(request: NextRequest) {
  const payload = await getJwtPayload();

  if (!payload?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  let req;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    req = schema.parse(params);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 500,
    });
  }

  const stats = await getAnswerStats(payload.sub, req.questionId);

  if (stats === null) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  }

  return new Response(
    JSON.stringify({
      stats,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
