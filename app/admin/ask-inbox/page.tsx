"use client";

import { CommunityAskList } from "@/components/CommunityAskList/CommunityAskList";
import { useCommunityAskListQuery } from "@/hooks/useCommunityAskListQuery";

export default function Page() {
  const askList = useCommunityAskListQuery();

  if (askList.isError) return <div>Error fetching ask list.</div>;

  if (askList.isLoading || !askList.data) return <div>Loading...</div>;

  if (askList.data.askList.length == 0)
    return <div>No unassigned questions found.</div>;

  const ACCEPT_POINTS = Number(
    process.env.NEXT_PUBLIC_ASK_ACCEPTED_POINTS_REWARD ?? 0,
  );
  const ANSWER_POINTS = Number(
    process.env.NEXT_PUBLIC_ASK_ANSWERED_POINTS_REWARD ?? 0,
  );

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

      <div className="flex flex-col gap-2">
        <CommunityAskList askList={askList?.data?.askList} />
      </div>
    </div>
  );
}
