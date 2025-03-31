"use client";

import { createAskQuestion } from "@/app/actions/ask/question";
import { useToast } from "@/app/providers/ToastProvider";
import { askQuestionSchema } from "@/app/schemas/ask";
import { uploadImageToS3Bucket } from "@/app/utils/file";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionType } from "@prisma/client";
import Image from "next/image";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

import { getDefaultOptions } from "../QuestionForm/QuestionForm";
import { TextInput } from "../TextInput/TextInput";
import { Button } from "../ui/button";

function AskForm() {
  const { errorToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: {
      question: "",
      type: QuestionType.MultiChoice,
      questionOptions: getDefaultOptions(QuestionType.MultiChoice),
      file: undefined,
    },
  });

  const file = watch("file")?.[0]; // The file for question image
  const questionPreviewUrl = file ? URL.createObjectURL(file) : null;
  const questionType = watch("type");

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (file && questionPreviewUrl) {
        URL.revokeObjectURL(questionPreviewUrl);
      }
    };
  }, [file, questionPreviewUrl]);

  const onSubmit = handleSubmit(async (data) => {
    let imageUrl;

    if (data.file?.[0]) {
      imageUrl = await uploadImageToS3Bucket(data.file[0]);
    }

    const result = await createAskQuestion({
      question: data?.question,
      type: data?.type,
      imageUrl,
      questionOptions: data?.questionOptions,
    });

    if (result?.errorMessage) {
      errorToast("Failed to save deck", result.errorMessage);
    }
    reset();
  });

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-3xl mb-3">Ask</h1>
      <div className="mb-3">
        <label className="block mb-1">Question statement</label>
        <TextInput variant="secondary" {...register("question")} />
        <div className="text-destructive">{errors.question?.message}</div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">Type</label>
        <select
          className="text-gray-800 w-full p-2 rounded"
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

      <div className="mb-3">
        <label className="block mb-1">Image (optional)</label>
        {questionPreviewUrl && (
          <div className="w-[77px] h-[77px] relative overflow-hidden rounded-lg mb-2">
            <Image
              fill
              alt="preview-image"
              src={questionPreviewUrl}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="flex flex-col gap-2 mt-2">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            {...register("file")}
          />
          <div className="text-destructive">{errors.file?.message}</div>

          {questionPreviewUrl && (
            <Button
              type="button"
              onClick={() => {
                setValue("file", undefined);
              }}
              variant="destructive"
              className="!w-fit !h-[30px]"
            >
              Remove Image
            </Button>
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-2">
        <label className="block">Options</label>
        {Array(questionType === QuestionType.MultiChoice ? 4 : 2)
          .fill(null)
          .map((_, index) => (
            <div key={`${questionType}-${index}`}>
              <div className="flex gap-4">
                <TextInput
                  variant="secondary"
                  placeholder={`Option ${index + 1}`}
                  {...register(`questionOptions.${index}.option`)}
                />
              </div>
              <div className="text-destructive">
                {errors.questionOptions?.[index]?.option?.message}
              </div>
            </div>
          ))}
      </div>
      <Button type="submit" disabled={isSubmitting} className="mb-8">
        Submit
      </Button>
    </form>
  );
}

export default AskForm;
