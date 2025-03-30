"use client";

import { CommunityAskList } from "@/components/CommunityAskList/CommunityAskList";
import { useCommunityAskListQuery } from "@/hooks/useCommunityAskListQuery";

export default function Page() {
  const askList = useCommunityAskListQuery();

  if (askList.isError) return <div>Error fetching ask list.</div>;

  if (askList.isLoading || !askList.data) return <div>Loading...</div>;

  if (askList.data.askList.length == 0)
    return <div>No unassigned questions found.</div>;

  return (
    <div className="flex flex-col gap-2">
      <CommunityAskList askList={askList?.data?.askList} />
    </div>
  );
}
