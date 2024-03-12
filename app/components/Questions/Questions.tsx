import { QuestionType } from "@prisma/client";

type QuestionsProps = {
  questions: Array<{ id: number; question: string; type: QuestionType }>;
};

export function Questions({ questions }: QuestionsProps) {
  return (
    <>
      {questions.map((q) => (
        <div key={q.id}>
          {q.question} - {q.type}
        </div>
      ))}
    </>
  );
}
