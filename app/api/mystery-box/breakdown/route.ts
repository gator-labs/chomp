import { getJwtPayload } from "@/app/actions/jwt";
import { getMysteryBoxBreakdown } from "@/lib/mysteryBox/getBreakdown";
import { type NextRequest } from "next/server";
import z from "zod";

const schema = z.object({
  id: z.string().uuid(),
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

  const mysteryBoxId = req.id;

  const breakdown = await getMysteryBoxBreakdown(payload.sub, mysteryBoxId);

  return new Response(
    JSON.stringify({
      breakdown,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
