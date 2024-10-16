import {
  Deck,
  DeckQuestion,
  Question,
  QuestionTag,
  Tag as TagType,
} from "@prisma/client";
import { DataTable } from "../DataTable/DataTable";
import { columns } from "./Columns";

export type DeckRowType = Deck & { deckLiveAt: Date | null } & {
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
  const data = decks.map(deck => ({...deck, deckLiveAt: deck.date || deck.activeFromDate}));

  const sortedData = data.sort((a, b) => {
    if (!a.deckLiveAt && b.deckLiveAt) return -1;

    if (!b.deckLiveAt && a.deckLiveAt) return 1;
    
    if (a.deckLiveAt && b.deckLiveAt) {
      const dateA = new Date(a.deckLiveAt).getTime(); 
      const dateB = new Date(b.deckLiveAt).getTime(); 
      return dateB - dateA; 
    }
  
    return 0;
  });

  return <DataTable columns={columns} data={sortedData} />;
}
