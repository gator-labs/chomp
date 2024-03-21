import { getQuestions } from "@/app/queries/question";
import { Questions } from "../../components/Questions/Questions";
import CreateQuestion from "../../components/CreateQuestionForm/CreateQuestionForm";
import { AdminPageLayout } from "../../components/AdminPageLayout/AdminPageLayout";

export default async function Page() {
  const questions = await getQuestions();

  return (
    <AdminPageLayout>
      <CreateQuestion />
      <Questions questions={questions} />
    </AdminPageLayout>
  );
}
