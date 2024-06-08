import { getJwtPayload } from "@chomp/app/actions/jwt";
import { getHistory, HistorySortOptions } from "@chomp/app/queries/history";

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

  return Response.json({
    history,
    totalRevealedRewards: 500000,
    potentialRewards: 340000,
  });
}
