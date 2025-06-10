export type CommunityAskFilter = "pending" | "accepted" | "archived";

export type CommunityAskSortBy = "createdAt" | "userId";

export type SortOrder = "asc" | "desc";

export type CommunityAskDeck = {
  id: number;
  title: string;
}
