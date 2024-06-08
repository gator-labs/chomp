import { handleInsertQuestions } from "@chomp/app/actions/question/question";
import { ImportQuestions } from "@chomp/app/components/ImportQuestions/ImportQuestions";

export default async function Page() {
  return <ImportQuestions action={handleInsertQuestions} />;
}
