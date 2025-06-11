import { CommunityAskQuestion } from "@/lib/ask/getCommunityAskList";
import { CommunityAskDeck } from "@/types/ask";

import { CommunityAskListItem } from "./CommunityAskListItem";

export type CommunityAskListProps = {
  askList: CommunityAskQuestion[];
  decks: CommunityAskDeck[];
};

export function CommunityAskList({ askList, decks }: CommunityAskListProps) {
  return (
    <div>
      {askList.map((question) => (
        <CommunityAskListItem
          question={question}
          key={question.id}
          decks={decks}
        />
      ))}
    </div>
  );
}
