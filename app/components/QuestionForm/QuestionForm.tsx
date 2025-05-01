"use client";

import { useToast } from "@/app/providers/ToastProvider";
import { questionSchema } from "@/app/schemas/question";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionType, Tag as TagType, Token } from "@prisma/client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { SubmitButton } from "../SubmitButton/SubmitButton";
import { Tag } from "../Tag/Tag";
import { TextInput } from "../TextInput/TextInput";

type QuestionFormProps = {
  question?: z.infer<typeof questionSchema>;
  tags: TagType[];
  action: (
    data: z.infer<typeof questionSchema>,
  ) => Promise<{ errorMessage: string } | void>;
};

export const getDefaultOptions = (type: QuestionType) => {
  switch (type) {
    case QuestionType.BinaryQuestion:
      return [
        { option: "", isCorrect: false, isLeft: true, index: 0 },
        { option: "", isCorrect: false, isLeft: false, index: 1 },
      ];
    default:
      return [
        { option: "", isCorrect: false, isLeft: false, index: 0 },
        { option: "", isCorrect: false, isLeft: false, index: 1 },
        { option: "", isCorrect: false, isLeft: false, index: 2 },
        { option: "", isCorrect: false, isLeft: false, index: 3 },
      ];
  }
};

export default function QuestionForm({
  question,
  tags,
  action,
}: QuestionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: question || {
      type: QuestionType.MultiChoice,
      questionOptions: getDefaultOptions(QuestionType.MultiChoice),
    },
  });

  const [selectedTagIds, setSelectedTagIds] = useState(question?.tagIds ?? []);

  const { errorToast } = useToast();

  const questionType = watch("type");

  const onSubmit = handleSubmit(async (data) => {
    const result = await action({
      ...data,
      tagIds: selectedTagIds,
      id: question?.id,
    });

    if (result?.errorMessage) {
      errorToast("An error occurred", result.errorMessage);
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-3xl mb-3">
        {question ? `Edit question #${question.id}` : "Create question"}
      </h1>

      <div className="mb-3">
        <label className="block mb-1">Question statement</label>
        <TextInput variant="secondary" {...register("question")} />
        <div className="text-destructive">{errors.question?.message}</div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Type</label>
        <select
          className="text-gray-800"
          {...register("type", {
            onChange: (e) => {
              setValue("questionOptions", getDefaultOptions(e.target.value));
            },
          })}
        >
          {Object.values(QuestionType).map((type) => (
            <option value={type} key={type}>
              {type}
            </option>
          ))}
        </select>
        <div className="text-destructive">{errors.type?.message}</div>
      </div>

      <div className="mb-3 flex flex-col gap-2">
        <label className="block">Options</label>
        {Array(questionType === QuestionType.MultiChoice ? 4 : 2)
          .fill(null)
          .map((_, index) => (
            <div key={`${questionType}-${index}`}>
              <div className="flex gap-4">
                <div className="w-1/4">
                  <TextInput
                    variant="secondary"
                    {...register(`questionOptions.${index}.option`)}
                  />
                </div>
              </div>
              <div className="w-28 flex justify-center items-center gap-2">
                <div>is correct?</div>
                <input
                  type="checkbox"
                  {...register(`questionOptions.${index}.isCorrect`)}
                />
              </div>
              {watch("type") === QuestionType.BinaryQuestion && (
                <div className="w-24 flex justify-center items-center gap-2">
                  <div>is left?</div>
                  <input
                    type="checkbox"
                    {...register(`questionOptions.${index}.isLeft`)}
                  />
                </div>
              )}
              <div className="text-destructive">
                {errors.questionOptions &&
                  errors.questionOptions[index]?.option?.message}
              </div>
            </div>
          ))}
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal token</label>
        <select className="text-gray-800" {...register("revealToken")}>
          {Object.values(Token).map((token) => (
            <option value={token} key={token}>
              {token}
            </option>
          ))}
        </select>
        <div className="text-destructive">{errors.revealToken?.message}</div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal token amount</label>
        <TextInput
          variant="secondary"
          {...register("revealTokenAmount", {
            setValueAs: (v) => (!v ? 0 : parseInt(v)),
            value: 5000,
          })}
        />
        <div className="text-destructive">
          {errors.revealTokenAmount?.message}
        </div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal at date (optional)</label>
        <Controller
          name="revealAtDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              showIcon
              selected={field.value}
              onChange={field.onChange}
              placeholderText="Reveal date"
              showTimeInput
              dateFormat="Pp"
              isClearable
            />
          )}
        />
        <div className="text-destructive">{errors.revealAtDate?.message}</div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal at answer count (optional)</label>
        <TextInput
          variant="secondary"
          {...register("revealAtAnswerCount", {
            setValueAs: (v) => (!v ? null : parseInt(v)),
          })}
        />
        <div className="text-destructive">
          {errors.revealAtAnswerCount?.message}
        </div>
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
                    : prev.filter((tagId) => tagId !== tag.id),
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
