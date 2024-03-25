"use client";

import { QuestionFormState } from "@/app/actions/question";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import { QuestionType } from "@prisma/client";
import { useFormState } from "react-dom";
import { TextInput } from "../TextInput/TextInput";
import { z } from "zod";
import { questionSchema } from "@/app/schemas/question";

const initialState = {
  errors: {},
};

type QuestionFormProps = {
  id?: number;
  question?: z.infer<typeof questionSchema>;
  action: (
    state: QuestionFormState,
    payload: FormData
  ) => QuestionFormState | Promise<QuestionFormState>;
};

export default function QuestionForm({
  question,
  action,
  id,
}: QuestionFormProps) {
  const [state, formAction] = useFormState<QuestionFormState, FormData>(
    action,
    { ...initialState, id }
  );

  return (
    <form action={formAction}>
      <div>
        <TextInput
          variant="secondary"
          type="text"
          name="question"
          defaultValue={question?.question}
        />
        {state.errors?.question &&
          state.errors.question.map((e) => <div key={e}>{e}</div>)}
      </div>

      <div>
        <select name="type" defaultValue={question?.type}>
          {Object.values(QuestionType).map((type) => (
            <option value={type} key={type}>
              {type}
            </option>
          ))}
        </select>
        {state.errors?.type &&
          state.errors.type.map((e) => <div key={e}>{e}</div>)}
      </div>

      <SubmitButton />
    </form>
  );
}
