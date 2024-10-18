import {
  Deck,
  DeckQuestion,
  Question,
  QuestionTag,
  Tag as TagType,
} from "@prisma/client";

import { DataTable } from "../DataTable/DataTable";
import { columns } from "./Columns";

export type DeckRowType = Deck & {
  deckQuestions: (DeckQuestion & {
    question: Question & {
      questionTags: (QuestionTag & {
        tag: TagType;
      })[];
    };
  })[];
};

type DeckListProps = {
  decks: DeckRowType[];
};

export function DeckList({ decks }: DeckListProps) {
  return <DataTable columns={columns} data={decks} />;
}
