import { handleInsertQuestions } from "@/app/actions/question/question";
import { ImportQuestions } from "@/app/components/ImportQuestions/ImportQuestions";

export default async function Page() {
  return <ImportQuestions action={handleInsertQuestions} />;
}
