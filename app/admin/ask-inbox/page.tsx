"use client";

import { CommunityAskList } from "@/components/CommunityAskList/CommunityAskList";
import { CommunityAskListTabs } from "@/components/CommunityAskList/CommunityAskListTabs";
import { CommunityAskStats } from "@/components/CommunityAskList/CommunityAskStats";
import { useCommunityAskListQuery } from "@/hooks/useCommunityAskListQuery";
import { useCommunityAskDecksQuery } from "@/hooks/useCommunityAskDecksQuery";
import { useCommunityAskStatsQuery } from "@/hooks/useCommunityAskStatsQuery";
import { CommunityAskFilter, CommunityAskSortBy, SortOrder } from "@/types/ask";
import { useState } from "react";

type SortPair = `${CommunityAskSortBy}-${SortOrder}`;

export default function Page() {
  const [selectedTab, setSelectedTab] = useState<CommunityAskFilter>("pending");
  const [sortBy, setSortBy] = useState<CommunityAskSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const askList = useCommunityAskListQuery(selectedTab, sortBy, sortOrder);
  const decks = useCommunityAskDecksQuery();
  const stats = useCommunityAskStatsQuery();

  const ACCEPT_POINTS = Number(
    process.env.NEXT_PUBLIC_ASK_ACCEPTED_POINTS_REWARD ?? 0,
  );
  const ANSWER_POINTS = Number(
    process.env.NEXT_PUBLIC_ASK_ANSWERED_POINTS_REWARD ?? 0,
  );

  const acceptedCount = stats?.data?.stats
    ? stats?.data?.stats.acceptedAllTime
    : null;
  const archivedCount = stats?.data?.stats
    ? stats?.data?.stats.archivedAllTime
    : null;
  const pendingCount = stats?.data?.stats
    ? stats?.data?.stats.pendingAllTime
    : null;

  const handleSetFilter = (value: SortPair) => {
    if (value === "createdAt-asc") {
      setSortOrder("asc");
      setSortBy("createdAt");
    } else if (value === "createdAt-desc") {
      setSortOrder("desc");
      setSortBy("createdAt");
    } else {
      setSortOrder("desc");
      setSortBy("userId");
    }
  };

  return (
    <div>
      <div className="block mb-1 text-xl font-medium">Ask Inbox</div>

      <hr className="border-gray-600 my-2 p-0" />

      <div className="flex flex-col gap-4">
        <p>
          Adding a question to the community deck will immediately reward the
          asker with <b className="text-purple-200">{ACCEPT_POINTS}</b> points.
        </p>

        <p>
          Answers to the question will earn the user{" "}
          <b className="text-purple-200">{ANSWER_POINTS}</b> points.
        </p>
      </div>

      <hr className="border-gray-600 my-2 p-0" />

      {stats.isError ? (
        <div>Error loading stats.</div>
      ) : stats.isLoading || !stats.data?.stats ? (
        <div>Loading stats...</div>
      ) : (
        <CommunityAskStats stats={stats.data.stats} />
      )}

      <hr className="border-gray-600 my-2 p-0" />

      <div className="float-right pb-2 flex items-center gap-2">
        {!askList.isLoading && askList.isRefetching && <span>Loading...</span>}
        <select
          disabled={askList.isFetching}
          onChange={(e) => handleSetFilter(e.target.value as SortPair)}
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="createdAt-desc">Submitted at (newest first)</option>
          <option value="createdAt-asc">Submitted at (oldest first)</option>
          <option value="userId-desc">User</option>
        </select>
      </div>

      <CommunityAskListTabs
        options={[
          { id: "pending", title: "Pending", count: pendingCount },
          { id: "accepted", title: "Accepted", count: acceptedCount },
          { id: "archived", title: "Archived", count: archivedCount },
        ]}
        selected={selectedTab}
        onSelect={(tab: CommunityAskFilter) => setSelectedTab(tab)}
      />

      {askList.isError ? (
        <div className="m-6">Error fetching ask list.</div>
      ) : askList.isLoading || !askList.data ? (
        <div className="m-6">Loading...</div>
      ) : askList.data?.askList.length === 0 ? (
        <div className="m-6">No questions found.</div>
      ) : null}

      {askList.data?.askList && (
        <div className="flex flex-col gap-2">
          <CommunityAskList askList={askList?.data?.askList} decks={decks?.data?.decks} />
        </div>
      )}
    </div>
  );
}
