"use client";

import { createAskQuestion } from "@/app/actions/ask/question";
import { useToast } from "@/app/providers/ToastProvider";
import { askQuestionSchema } from "@/app/schemas/ask";
import { uploadImageToS3Bucket } from "@/app/utils/file";
import { getAlphaIdentifier } from "@/app/utils/question";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionType } from "@prisma/client";
import { ArrowRight, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

import { TextInput } from "../TextInput/TextInput";
import { Button } from "../ui/button";

const MAX_QUESTION_LENGTH = 120;

const getDefaultOptions = (type: QuestionType) => {
  switch (type) {
    case QuestionType.BinaryQuestion:
      return [{ option: "" }, { option: "" }];
    default:
      return [{ option: "" }, { option: "" }, { option: "" }, { option: "" }];
  }
};

enum Page {
  QuestionType,
  QuestionForm,
  Confirmation,
}

type AskFormProps = {
  questionType: QuestionType;
  onSetPage: (page: Page) => void;
};

function AskForm({ questionType }: AskFormProps) {
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
  const questionText = watch("question");

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
      <div className="mb-3">
        <label className="block mb-1 text-base font-medium">Question</label>
        <TextInput
          variant="outline"
          {...register("question")}
          placeholder="What's something you want the crowd's opinion on?"
        />
        <div className="flex justify-end text-xs text-gray-500 font-medium pt-1">
          {questionText.length}/{MAX_QUESTION_LENGTH}
        </div>
        <div className="text-destructive">{errors.question?.message}</div>
      </div>
      <hr className="border-gray-600 my-2 p-0" />

      <div className="mb-3 flex flex-col gap-2">
        <label className="block text-base font-medium">Answer Choices</label>
        {Array(questionType === QuestionType.MultiChoice ? 4 : 2)
          .fill(null)
          .map((_, index) => (
            <div key={`${questionType}-${index}`}>
              <div className="flex gap-4">
                <TextInput
                  variant="outline"
                  placeholder={`Choice ${getAlphaIdentifier(index)}`}
                  {...register(`questionOptions.${index}.option`)}
                />
              </div>
              <div className="text-destructive">
                {errors.questionOptions?.[index]?.option?.message}
              </div>
            </div>
          ))}
      </div>
      <hr className="border-gray-600 my-2 p-0" />
      <div className="mb-3">
        <label className="block mb-1 text-base font-medium">
          Image <span className="text-gray-500">(optional)</span>
        </label>
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
            >
              Delete <Trash2 size={18} />
            </Button>
          )}
        </div>
      </div>

      {!questionPreviewUrl && (
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mb-2"
          variant="outline"
        >
          Upload Image <Upload size={18} />
        </Button>
      )}

      <Button type="submit" disabled={isSubmitting} className="mb-8">
        Next <ArrowRight size={18} />
      </Button>
    </form>
  );
}

export default AskForm;
