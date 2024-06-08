import { Button } from "@chomp/app/components/Button/Button";
import { QuestionList } from "@chomp/app/components/QuestionList/QuestionList";
import { getQuestions } from "@chomp/app/queries/question";
import Link from "next/link";

export default async function Page() {
  const questions = await getQuestions();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <Link href="/admin/questions/import">
          <Button variant="primary">Import</Button>
        </Link>
        <Link href="/admin/questions/new">
          <Button variant="primary">New</Button>
        </Link>
      </div>

      <QuestionList questions={questions} />
    </div>
  );
}
