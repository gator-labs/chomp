import { getJwtPayload } from "@/app/actions/jwt";
import { getHomeFeed } from "@/app/queries/question";

export async function GET(request: Request) {
  const payload = await getJwtPayload();

  if (!payload) {
    return Response.json({ message: "invalid jwt" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toString();
  const homeFeed = await getHomeFeed(query ?? "");

  return Response.json({ homeFeed });
}
