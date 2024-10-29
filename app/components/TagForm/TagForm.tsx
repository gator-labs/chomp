"use client";

import { tagSchema } from "@/app/schemas/tag";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SubmitButton } from "../SubmitButton/SubmitButton";
import { TextInput } from "../TextInput/TextInput";

type TagFormProps = {
  tag?: z.infer<typeof tagSchema>;
  action: (data: z.infer<typeof tagSchema>) => void;
};

export default function TagForm({ tag, action }: TagFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: tag,
  });

  return (
    <form onSubmit={handleSubmit((data) => action({ ...data, id: tag?.id }))}>
      <h1 className="text-3xl mb-3">
        {tag ? `Edit tag #${tag.id}` : "Create tag"}
      </h1>

      <div className="mb-3">
        <label className="block mb-1">Tag</label>
        <TextInput variant="secondary" {...register("tag")} />
        <div className="text-destructive">{errors.tag?.message}</div>
      </div>

      <SubmitButton />
    </form>
  );
}
