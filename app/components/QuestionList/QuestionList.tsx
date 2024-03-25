import { QuestionType } from "@prisma/client";
import Link from "next/link";
import { Button } from "../Button/Button";

type QuestionListProps = {
  questions: Array<{ id: number; question: string; type: QuestionType }>;
};

export function QuestionList({ questions }: QuestionListProps) {
  return (
    <table className="w-full border-separate border-spacing-2">
      <tbody>
        <tr>
          <th className="text-left">Question</th>
          <th className="text-left">Type</th>
          <th className="text-left">Actions</th>
        </tr>
        {questions.map((q) => (
          <tr key={q.id}>
            <td>{q.question}</td>
            <td>{q.type}</td>
            <td>
              <div className="flex gap-2">
                <Link href={`/admin/questions/${q.id}`} className="w-24">
                  <Button variant="primary">Edit</Button>
                </Link>
                <Button variant="secondary" className="w-24">
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
