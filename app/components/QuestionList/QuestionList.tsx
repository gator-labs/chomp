import { Question, QuestionTag, Tag as TagType } from "@prisma/client";
import Link from "next/link";
import { Button } from "../Button/Button";
import { Tag } from "../Tag/Tag";

type QuestionListProps = {
  questions: (Question & {
    questionTags: (QuestionTag & { tag: TagType })[];
  })[];
};

export function QuestionList({ questions }: QuestionListProps) {
  return (
    <table className="w-full border-separate border-spacing-2">
      <tbody>
        <tr>
          <th className="text-left">Question</th>
          <th className="text-left">Type</th>
          <th className="text-left">Reveal token</th>
          <th className="text-left">Reveal amount</th>
          <th className="text-left">Reveal at</th>
          <th className="text-left">Tags</th>
          <th className="text-left">Actions</th>
        </tr>
        {questions.map((q) => (
          <tr key={q.id}>
            <td>{q.question}</td>
            <td>{q.type}</td>
            <td>{q.revealToken}</td>
            <td>{q.revealTokenAmount}</td>
            <td>
              {q.revealAtDate?.toString() || ""}{" "}
              {q.revealAtAnswerCount && `(${q.revealAtAnswerCount} answers)`}
            </td>
            <td>
              <div className="flex gap-2">
                {q.questionTags.map((t) => (
                  <Tag tag={t.tag.tag} key={t.id} />
                ))}
              </div>
            </td>
            <td>
              <Link href={`/admin/questions/${q.id}`}>
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
