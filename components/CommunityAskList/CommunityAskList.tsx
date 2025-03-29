import { CommunityAskQuestion } from "@/lib/ask/getCommunityAskList";

import { CommunityAskListItem } from "./CommunityAskListItem";

export type CommunityAskListProps = {
  askList: CommunityAskQuestion[];
};

export function CommunityAskList({ askList }: CommunityAskListProps) {
  return (
    <div>
      {askList.map((question) => (
        <CommunityAskListItem question={question} key={question.id} />
      ))}
    </div>
  );
}
