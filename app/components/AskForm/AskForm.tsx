"use client";

import { createAskQuestion } from "@/app/actions/ask/question";
import { useToast } from "@/app/providers/ToastProvider";
import { MAX_QUESTION_LENGTH, askQuestionSchema } from "@/app/schemas/ask";
import { uploadImageToS3Bucket } from "@/app/utils/file";
import { getAlphaIdentifier } from "@/app/utils/question";
import { AskQuestionPreview } from "@/components/AskWizard/AskQuestionPreview";
import ConfirmRemoveImageDrawer from "@/components/AskWizard/ConfirmRemoveImageDrawer";
import ImageUploadErrorDrawer from "@/components/AskWizard/ImageUploadErrorDrawer";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionType } from "@prisma/client";
import { ArrowLeft, ArrowRight, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { TextInput } from "../TextInput/TextInput";
import { Button } from "../ui/button";

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

function AskForm({ questionType, onSetPage }: AskFormProps) {
  const { errorToast } = useToast();

  const [isShowingPreview, setIsShowingPreview] = useState<boolean>(false);
  const [isImageUploadErrorDrawerOpen, setIsImageUploadErrorDrawerOpen] =
    useState<boolean>(false);
  const [isConfirmRemoveImageDrawerOpen, setIsConfirmRemoveImageDrawerOpen] =
    useState<boolean>(false);

  const uploadButtonRef = useRef<HTMLInputElement>(null);

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
      type: questionType,
      questionOptions: getDefaultOptions(QuestionType.MultiChoice),
      file: undefined,
    },
  });

  const file = watch("file")?.[0]; // The file for question image
  const questionPreviewUrl = file ? URL.createObjectURL(file) : null;
  const questionText = watch("question");
  const fileElement = register("file");

  const options = watch("questionOptions")
    .slice(0, questionType == QuestionType.BinaryQuestion ? 2 : 4)
    .map((o) => o.option);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (file && questionPreviewUrl) {
        URL.revokeObjectURL(questionPreviewUrl);
      }
    };
  }, [file, questionPreviewUrl]);

  const handleRemoveImage = () => {
    setValue("file", undefined);
    setIsConfirmRemoveImageDrawerOpen(false);
  };

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

    if (!result?.errorMessage) {
      onSetPage(Page.Confirmation);
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <div className={cn({ hidden: isShowingPreview })}>
        <div className="mb-3">
          <label className="block mb-1 text-base font-medium">Question</label>
          <TextInput hidden={true} variant="outline" {...register("type")} />
          <textarea
            rows={4}
            {...register("question")}
            placeholder="What's something you want the crowd's opinion on?"
            className={cn(
              "bg-black w-full border p-2 text-sm font-medium border-gray-700 rounded-lg",
              {
                "border-destructive": questionText.length > MAX_QUESTION_LENGTH,
              },
            )}
          />
          <div
            className={cn(
              "flex justify-end text-xs text-gray-500 font-medium pt-1",
              { "text-destructive": questionText.length > MAX_QUESTION_LENGTH },
            )}
          >
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
            <div className="w-full relative mb-2">
              <Image
                width={0}
                height={0}
                alt="preview-image"
                src={questionPreviewUrl}
                style={{ width: "100%", height: "auto", borderRadius: "1em" }}
                className="object-contain"
                sizes="100vw"
              />
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              hidden={true}
              {...register("file")}
              ref={(e) => {
                fileElement.ref(e);
                (
                  uploadButtonRef as MutableRefObject<HTMLInputElement | null>
                ).current = e;
              }}
            />

            {!questionPreviewUrl && (
              <Button
                disabled={isSubmitting}
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  uploadButtonRef?.current?.click();
                }}
              >
                Upload Image <Upload size={18} color="#999999" />
              </Button>
            )}

            {errors.file?.message && (
              <div className="text-destructive">{errors.file?.message}</div>
            )}

            {questionPreviewUrl && (
              <Button
                type="button"
                onClick={() => {
                  setIsConfirmRemoveImageDrawerOpen(true);
                }}
                variant="destructive"
              >
                Delete <Trash2 size={18} />
              </Button>
            )}

            <Button
              disabled={isSubmitting}
              className="mb-8"
              onClick={() => setIsShowingPreview(true)}
            >
              Next <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
      {isShowingPreview && (
        <div className="flex flex-col gap-2">
          <AskQuestionPreview
            title={questionText}
            options={options}
            imageUrl={questionPreviewUrl}
          />
          <div className="flex gap-2">
            <Button
              disabled={isSubmitting}
              variant="outline"
              className="aspect-square max-w-[4em]"
              onClick={() => {
                setIsShowingPreview(false);
              }}
            >
              <ArrowLeft size={18} />
            </Button>
            <Button type="submit" disabled={isSubmitting} className="mb-8">
              Submit
            </Button>
          </div>
        </div>
      )}
      <ImageUploadErrorDrawer
        isOpen={isImageUploadErrorDrawerOpen}
        onClose={() => setIsImageUploadErrorDrawerOpen(false)}
      />
      <ConfirmRemoveImageDrawer
        isOpen={isConfirmRemoveImageDrawerOpen}
        onConfirm={handleRemoveImage}
        onCancel={() => setIsConfirmRemoveImageDrawerOpen(false)}
      />
    </form>
  );
}

export default AskForm;
