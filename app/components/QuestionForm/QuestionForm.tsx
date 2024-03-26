"use client";

import { QuestionFormState } from "@/app/actions/question";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import { QuestionType, Tag, Token } from "@prisma/client";
import { useFormState } from "react-dom";
import { TextInput } from "../TextInput/TextInput";
import { z } from "zod";
import { questionSchema } from "@/app/schemas/question";
import { Tag as TagComponent } from "../Tag/Tag";
import { useState } from "react";

const initialState = {
  errors: {},
};

type QuestionFormProps = {
  id?: number;
  question?: z.infer<typeof questionSchema>;
  tags: Tag[];
  action: (
    state: QuestionFormState,
    payload: FormData
  ) => QuestionFormState | Promise<QuestionFormState>;
};

export default function QuestionForm({
  question,
  tags,
  action,
  id,
}: QuestionFormProps) {
  const [state, formAction] = useFormState<QuestionFormState, FormData>(
    action,
    { ...initialState, id }
  );

  const [selectedTags, setSelectedTags] = useState(question?.tags || []);

  return (
    <form action={formAction}>
      <h1 className="text-3xl mb-3">
        {id ? `Edit question #${id}` : "Create question"}
      </h1>

      <div className="mb-3">
        <label className="block mb-1">Question statement</label>
        <TextInput
          variant="secondary"
          type="text"
          name="question"
          defaultValue={question?.question}
        />
        {state.errors?.question &&
          state.errors.question.map((e) => <div key={e}>{e}</div>)}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Type</label>
        <select
          name="type"
          defaultValue={question?.type}
          className="text-black"
        >
          {Object.values(QuestionType).map((type) => (
            <option value={type} key={type}>
              {type}
            </option>
          ))}
        </select>
        {state.errors?.type &&
          state.errors.type.map((e) => <div key={e}>{e}</div>)}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal token</label>
        <select
          name="revealToken"
          defaultValue={question?.revealToken}
          className="text-black"
        >
          {Object.values(Token).map((token) => (
            <option value={token} key={token}>
              {token}
            </option>
          ))}
        </select>
        {state.errors?.revealToken &&
          state.errors.revealToken.map((e) => <div key={e}>{e}</div>)}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal token amount</label>
        <TextInput
          variant="secondary"
          type="number"
          name="revealTokenAmount"
          defaultValue={question?.revealTokenAmount}
        />
        {state.errors?.revealTokenAmount &&
          state.errors.revealTokenAmount.map((e) => <div key={e}>{e}</div>)}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal at date (optional)</label>
        <TextInput
          variant="secondary"
          type="datetime-local"
          name="revealAtDate"
          defaultValue={question?.revealAtDate
            ?.toISOString()
            .replace(/.\d+Z$/g, "")}
        />
        {state.errors?.revealAtDate &&
          state.errors.revealAtDate.map((e) => <div key={e}>{e}</div>)}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal at answer count (optional)</label>
        <TextInput
          variant="secondary"
          type="number"
          name="revealAtAnswerCount"
          defaultValue={question?.revealAtAnswerCount || undefined}
        />
        {state.errors?.revealAtAnswerCount &&
          state.errors.revealAtAnswerCount.map((e) => <div key={e}>{e}</div>)}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Tags (optional)</label>
        <div className="flex gap-2">
          {tags.map((tag) => (
            <div key={tag.id}>
              <input
                type="checkbox"
                name="tag[]"
                value={tag.id}
                checked={selectedTags.includes(tag.id)}
                className="hidden"
              />
              <TagComponent
                tag={tag.tag}
                isSelected={selectedTags.includes(tag.id)}
                onSelected={() =>
                  setSelectedTags((prev) =>
                    !prev.includes(tag.id)
                      ? [...prev, tag.id]
                      : prev.filter((tagId) => tagId !== tag.id)
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
