"use client";

import { askQuestionSchema } from "@/app/schemas/ask";
import { questionSchema } from "@/app/schemas/question";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionType } from "@prisma/client";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";

import { getDefaultOptions } from "../QuestionForm/QuestionForm";
import { SubmitButton } from "../SubmitButton/SubmitButton";
import { TextInput } from "../TextInput/TextInput";

function AskForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    watch,
    setValue,
    control,
    getFieldState,
  } = useForm({
    resolver: zodResolver(askQuestionSchema),
    // defaultValues: deck || {
    //     questions: [
    //         {
    //             type: QuestionType.MultiChoice,
    //             questionOptions: getDefaultOptions(QuestionType.MultiChoice),
    //             file: [],
    //         },
    //     ],
    //     creditCostPerQuestion: 0,
    // },
  });
  console.log(errors);
  const file = watch("file")?.[0]; // The file for deck image
  const questionImage = watch("imageUrl"); // The URL for the deck image
  const questionPreviewUrl = !!file
    ? URL.createObjectURL(file!)
    : questionImage;

  const questionType = watch("type");

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
  });

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-3xl mb-3">Ask</h1>
      <div className="mb-3">
        <label className="block mb-1">Question statement</label>
        <TextInput variant="secondary" {...register("question")} />
        {/* <div className="text-destructive">{JSON.stringify(errors)}</div> */}

        <div className="mb-3">
          <label className="block mb-1">Type</label>
          <select
            className="text-gray-800"
            {...register(`type`, {
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
          {/* <div className="text-destructive">{errors.type?.message}</div> */}
        </div>

        <div className="mb-3">
          <label className="block mb-1">Image URL (optional)</label>
          {!!questionPreviewUrl && (
            <div className="w-[77px] h-[77px] relative overflow-hidden rounded-lg">
              <Image
                fill
                alt="preview-image-stack"
                src={questionPreviewUrl}
                className="object-cover w-full h-full"
              />
            </div>
          )}
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
                </div>
                {/* <div className="text-destructive">
                  {errors.questionOptions &&
                    errors.questionOptions[index]?.option?.message}
                </div> */}
              </div>
            ))}
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}

export default AskForm;
