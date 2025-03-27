"use client";

import { deckSchema } from "@/app/schemas/deck";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionType } from "@prisma/client";
import { getDefaultOptions } from "date-fns";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";

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
    resolver: zodResolver(deckSchema),
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

  const file = watch("file")?.[0]; // The file for deck image
  const deckImage = watch("imageUrl"); // The URL for the deck image
  const deckPreviewUrl = !!file ? URL.createObjectURL(file!) : deckImage;

  return (
    <div>
      <h1 className="text-3xl mb-3">Ask</h1>
      <div className="mb-3">
        <label className="block mb-1">Question statement</label>
        <TextInput variant="secondary" {...register("deck")} />
        <div className="text-destructive">
          {/* {errors.questions &&
                        errors.questions[questionIndex]?.question?.message} */}
        </div>

        <div className="mb-3">
          <label className="block mb-1">Image URL (optional)</label>
          {!!deckPreviewUrl && (
            <div className="w-[77px] h-[77px] relative overflow-hidden rounded-lg">
              <Image
                fill
                alt="preview-image-stack"
                src={deckPreviewUrl}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AskForm;
