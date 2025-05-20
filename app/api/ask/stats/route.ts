import { getJwtPayload } from "@/app/actions/jwt";
import { getIsUserAdmin } from "@/app/queries/user";
import { getCommunityAskStats } from "@/lib/ask/getCommunityAskStats";

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

  const stats = await getCommunityAskStats();

  return new Response(
    JSON.stringify({
      stats,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
