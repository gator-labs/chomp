import {
  Deck,
  DeckQuestion,
  Question,
  QuestionTag,
  Tag as TagType,
} from "@prisma/client";
import Link from "next/link";
import { Button } from "../Button/Button";
import { Tag } from "../Tag/Tag";

type DeckListProps = {
  decks: (Deck & {
    deckQuestions: (DeckQuestion & {
      question: Question & {
        questionTags: (QuestionTag & {
          tag: TagType;
        })[];
      };
    })[];
  })[];
};

export function DeckList({ decks }: DeckListProps) {
  return (
    <table className="w-full border-separate border-spacing-2">
      <tbody>
        <tr>
          <th className="text-left">Question</th>
          <th className="text-left">Reveal token</th>
          <th className="text-left">Reveal amount</th>
          <th className="text-left">Reveal at</th>
          <th className="text-left">Tags</th>
          <th className="text-left">Actions</th>
        </tr>
        {decks.map((d) => (
          <tr key={d.id}>
            <td>{d.deck}</td>
            <td>{d.deckQuestions[0].question.revealToken}</td>
            <td>{d.deckQuestions[0].question.revealTokenAmount}</td>
            <td>
              {d.revealAtDate?.toString() || ""}{" "}
              {d.revealAtAnswerCount && `(${d.revealAtAnswerCount} answers)`}
            </td>
            <td>
              <div className="flex gap-2">
                {d.deckQuestions[0].question.questionTags.map((t) => (
                  <Tag tag={t.tag.tag} key={t.id} />
                ))}
              </div>
            </td>
            <td>
              <Link href={`/admin/decks/${d.id}`}>
                <Button variant="primary" isFullWidth={false}>
                  Edit
                </Button>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
