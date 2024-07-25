"use client";
import { HistoryResult } from "@/app/queries/history";

import { HistoryFeedRowCard } from "../HistoryFeedRowCard/HistoryFeedRowCard";

export type HistoryFeedProps = {
  list: HistoryResult[];
};

function HistoryFeed({ list }: HistoryFeedProps) {
  return (
    <ul className="flex flex-col gap-2 overflow-y-auto pb-2">
      {list.map((item) => (
        <li key={item.id}>
          <HistoryFeedRowCard element={item} />
        </li>
      ))}
    </ul>
  );
}

export default HistoryFeed;
