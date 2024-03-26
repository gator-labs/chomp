"use client";

import { SubmitButton } from "../SubmitButton/SubmitButton";
import { QuestionType, Tag as TagType, Token } from "@prisma/client";
import { TextInput } from "../TextInput/TextInput";
import { z } from "zod";
import { questionSchema } from "@/app/schemas/question";
import { Tag } from "../Tag/Tag";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type QuestionFormProps = {
  question?: z.infer<typeof questionSchema>;
  tags: TagType[];
  action: (data: z.infer<typeof questionSchema>) => void;
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
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: question,
  });

  const [selectedTagIds, setSelectedTagIds] = useState(question?.tagIds ?? []);

  return (
    <form
      onSubmit={handleSubmit((data) =>
        action({ ...data, tagIds: selectedTagIds, id: question?.id })
      )}
    >
      <h1 className="text-3xl mb-3">
        {question ? `Edit question #${question.id}` : "Create question"}
      </h1>

      <div className="mb-3">
        <label className="block mb-1">Question statement</label>
        <TextInput variant="secondary" {...register("question")} />
        <div>{errors.question?.message}</div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Type</label>
        <select className="text-black" {...register("type")}>
          {Object.values(QuestionType).map((type) => (
            <option value={type} key={type}>
              {type}
            </option>
          ))}
        </select>
        <div>{errors.type?.message}</div>
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
          {...register("revealTokenAmount", { valueAsNumber: true })}
        />
        <div>{errors.revealTokenAmount?.message}</div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal at date (optional)</label>
        <TextInput
          variant="secondary"
          type="datetime-local"
          {...register("revealAtDate", { valueAsDate: true })}
        />
        <div>{errors.revealAtDate?.message}</div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Reveal at answer count (optional)</label>
        <TextInput
          variant="secondary"
          {...register("revealAtAnswerCount", { valueAsNumber: true })}
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
