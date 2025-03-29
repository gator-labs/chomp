import { getJwtPayload } from "@/app/actions/jwt";
import { getIsUserAdmin } from "@/app/queries/user";
import { getCommunityAskList } from "@/lib/ask/getCommunityAskList";

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
