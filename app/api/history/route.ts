import { getJwtPayload } from "@/app/actions/jwt";
import {
  getHistory,
  getTotalRevealedRewards,
  HistorySortOptions,
} from "@/app/queries/history";

export async function GET(request: Request) {
  const payload = await getJwtPayload();

  if (!payload) {
    return Response.json({ message: "invalid jwt" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sort =
    HistorySortOptions[
      searchParams.get("sort")?.toString() as keyof typeof HistorySortOptions
    ];
  const history = await getHistory(sort ?? HistorySortOptions.Date);
  const totalRevealedRewards = await getTotalRevealedRewards();

  return Response.json({
    history,
    totalRevealedRewards,
  });
}
