import { getQuestions } from "@/app/queries/question";
import { Questions } from "../../components/Questions/Questions";
import CreateQuestion from "../../components/CreateQuestionForm/CreateQuestionForm";

export default async function Page() {
  const questions = await getQuestions();

  return (
    <>
      <CreateQuestion />
      <Questions questions={questions} />
    </>
  );
}
