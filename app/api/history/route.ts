import { getJwtPayload } from "@/app/actions/jwt";
import { getHistory } from "@/app/queries/question";

export enum HistorySortOptions {
  Date = "Date",
  Revealed = "Revealed",
  Claimable = "Claimable",
}

export async function GET(request: Request) {
  const payload = await getJwtPayload();

  if (!payload) {
    return Response.json({ message: "invalid jwt" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toString();
  const sort =
    HistorySortOptions[
      searchParams.get("sort")?.toString() as keyof typeof HistorySortOptions
    ];
  const history = await getHistory(
    query ?? "",
    sort ?? HistorySortOptions.Date,
  );

  return Response.json({
    history,
    totalRevealedRewards: 500000,
    potentionalRewards: 340000,
  });
}
