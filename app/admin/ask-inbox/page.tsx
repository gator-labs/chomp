"use client";

import { CommunityAskList } from "@/components/CommunityAskList/CommunityAskList";
import { CommunityAskListTabs } from "@/components/CommunityAskList/CommunityAskListTabs";
import { CommunityAskStats } from "@/components/CommunityAskList/CommunityAskStats";
import { useCommunityAskListQuery } from "@/hooks/useCommunityAskListQuery";
import { useCommunityAskStatsQuery } from "@/hooks/useCommunityAskStatsQuery";
import { useState } from "react";
import { CommunityAskFilter } from '@/types/ask';

export default function Page() {
  const [selectedTab, setSelectedTab] = useState<CommunityAskFilter>("pending");

  const askList = useCommunityAskListQuery(selectedTab);
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
          <CommunityAskList askList={askList?.data?.askList} />
        </div>
      )}
    </div>
  );
}
