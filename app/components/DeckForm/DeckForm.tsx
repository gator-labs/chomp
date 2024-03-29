"use client";

import { SubmitButton } from "../SubmitButton/SubmitButton";
import { QuestionType, Tag as TagType, Token } from "@prisma/client";
import { TextInput } from "../TextInput/TextInput";
import { z } from "zod";
import { Tag } from "../Tag/Tag";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deckSchema } from "@/app/schemas/deck";
import { Button } from "../Button/Button";
import { getDefaultOptions } from "../QuestionForm/QuestionForm";

type DeckFormProps = {
  deck?: z.infer<typeof deckSchema>;
  tags: TagType[];
  action: (data: z.infer<typeof deckSchema>) => void;
};

export default function DeckForm({ deck, tags, action }: DeckFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(deckSchema),
    defaultValues: deck || {
      questions: [
        {
          type: QuestionType.MultiChoice,
          questionOptions: getDefaultOptions(QuestionType.MultiChoice),
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const [selectedTagIds, setSelectedTagIds] = useState(deck?.tagIds ?? []);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        action({ ...data, tagIds: selectedTagIds, id: deck?.id });
      })}
    >
      <h1 className="text-3xl mb-3">
        {deck ? `Edit deck #${deck.id}` : "Create deck"}
      </h1>

      <div className="mb-3">
        <label className="block mb-1">Deck title</label>
        <TextInput variant="secondary" {...register("deck")} />
        <div>{errors.deck?.message}</div>
      </div>

      <div className="mb-3">
        {fields.map((field, questionIndex) => (
          <fieldset
            name={`questions.${questionIndex}`}
            key={`questions.${questionIndex}`}
          >
            <h2 className="text-xl mb-2">Question #{questionIndex + 1}</h2>

            <div>
              {errors.questions && errors.questions[questionIndex]?.message}
            </div>

            <div className="mb-3">
              <label className="block mb-1">Question statement</label>
              <TextInput
                variant="secondary"
                {...register(`questions.${questionIndex}.question`)}
              />
              <div>
                {errors.questions &&
                  errors.questions[questionIndex]?.question?.message}
              </div>
            </div>

            <div className="mb-3">
              <label className="block mb-1">Type</label>
              <select
                className="text-black"
                {...register(`questions.${questionIndex}.type`, {
                  onChange: (e) => {
                    setValue(
                      `questions.${questionIndex}.questionOptions`,
                      getDefaultOptions(e.target.value)
                    );
                  },
                })}
              >
                {Object.values(QuestionType).map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3 flex flex-col gap-2">
              <label className="block">Options</label>
              {Array(
                watch(`questions.${questionIndex}.type`) ===
                  QuestionType.MultiChoice
                  ? 4
                  : 2
              )
                .fill(null)
                .map((_, optionIndex) => (
                  <div key={`${questionIndex}-${optionIndex}`}>
                    <div className="flex gap-4">
                      <div className="w-1/4">
                        <TextInput
                          variant="secondary"
                          {...register(
                            `questions.${questionIndex}.questionOptions.${optionIndex}.option`
                          )}
                          disabled={
                            watch(`questions.${questionIndex}.type`) ===
                              QuestionType.YesNo ||
                            watch(`questions.${questionIndex}.type`) ===
                              QuestionType.TrueFalse
                          }
                        />
                      </div>
                      <div className="w-24 flex justify-center items-center gap-2">
                        <div>is true?</div>
                        <input
                          type="checkbox"
                          {...register(
                            `questions.${questionIndex}.questionOptions.${optionIndex}.isTrue`
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      {errors.questions &&
                        errors.questions[questionIndex]?.questionOptions &&
                        errors.questions[questionIndex]?.questionOptions![
                          optionIndex
                        ]?.option?.message}
                    </div>
                  </div>
                ))}
            </div>

            {questionIndex !== 0 && (
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  remove(questionIndex);
                }}
                className="mb-3"
              >
                Remove
              </Button>
            )}
          </fieldset>
        ))}

        {fields.length < 20 && (
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              append({
                type: fields[fields.length - 1].type,
                question: "",
                questionOptions: getDefaultOptions(
                  fields[fields.length - 1].type
                ),
              });
            }}
          >
            New question
          </Button>
        )}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal token</label>
        <select className="text-black" {...register("revealToken")}>
          {Object.values(Token).map((token) => (
            <option value={token} key={token}>
              {token}
            </option>
          ))}
        </select>
        <div>{errors.revealToken?.message}</div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal token amount</label>
        <TextInput
          variant="secondary"
          {...register("revealTokenAmount", {
            setValueAs: (v) => (!v ? null : parseInt(v)),
          })}
          defaultValue={0}
        />
        <div>{errors.revealTokenAmount?.message}</div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal at date (optional)</label>
        <TextInput
          variant="secondary"
          type="datetime-local"
          {...register("revealAtDate", {
            setValueAs: (v) => (!v ? null : new Date(v)),
          })}
        />
        <div>{errors.revealAtDate?.message}</div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal at answer count (optional)</label>
        <TextInput
          variant="secondary"
          {...register("revealAtAnswerCount", {
            setValueAs: (v) => (!v ? null : parseInt(v)),
          })}
        />
        <div>{errors.revealAtAnswerCount?.message}</div>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Tags (optional)</label>
        <div className="flex gap-2">
          {tags.map((tag) => (
            <Tag
              tag={tag.tag}
              onSelected={() =>
                setSelectedTagIds((prev) =>
                  !prev.includes(tag.id)
                    ? [...prev, tag.id]
                    : prev.filter((tagId) => tagId !== tag.id)
                )
              }
              isSelected={selectedTagIds.includes(tag.id)}
              key={tag.id}
            />
          ))}
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
