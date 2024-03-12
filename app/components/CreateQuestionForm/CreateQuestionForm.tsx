"use client";

import { CreateQuestionState, createQuestion } from "@/app/actions/question";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import { QuestionType } from "@prisma/client";
import { useFormState } from "react-dom";

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
      <input type="text" name="question" />
      {state.errors?.question &&
        state.errors.question.map((e) => <div key={e}>{e}</div>)}
      <div>
        <select name="type">
          <option value={QuestionType.TrueFalse}>
            {QuestionType.TrueFalse}
          </option>
          <option value={QuestionType.YesNo}>{QuestionType.YesNo}</option>
          <option value={QuestionType.MultiChoice}>
            {QuestionType.MultiChoice}
          </option>
        </select>
      </div>
      {state.errors?.type &&
        state.errors.type.map((e) => <div key={e}>{e}</div>)}
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
