"use client";

import { CreateQuestionState, createQuestion } from "@/app/actions/question";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import { QuestionType } from "@prisma/client";
import { useFormState } from "react-dom";
import { TextInput } from "../TextInput/TextInput";

const initialState = {
  errors: {},
};

export default function CreateQuestion() {
  const [state, createQuestionAction] = useFormState<
    CreateQuestionState,
    FormData
  >(createQuestion, initialState);

  return (
    <form action={createQuestionAction}>
      <div>
        <TextInput variant="secondary" type="text" name="question" />
        {state.errors?.question &&
          state.errors.question.map((e) => <div key={e}>{e}</div>)}
      </div>

      <div>
        <select name="type">
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
