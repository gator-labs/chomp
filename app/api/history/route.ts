import { getJwtPayload } from "@/app/actions/jwt";
import {
  getHistory,
  HistorySortOptions,
  HistoryTypeOptions,
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
  const type =
    HistoryTypeOptions[
      searchParams.get("type") as keyof typeof HistoryTypeOptions
    ];
  const history = await getHistory(
    sort ?? HistorySortOptions.Date,
    type ?? HistoryTypeOptions.Deck,
  );

  return Response.json({
    history,
  });
}
