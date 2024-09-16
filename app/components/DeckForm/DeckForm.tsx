"use client";

import { useToast } from "@/app/providers/ToastProvider";
import { deckSchema } from "@/app/schemas/deck";
import { uploadImageToS3Bucket } from "@/app/utils/file";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campaign, QuestionType, Tag as TagType, Token } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../Button/Button";
import { getDefaultOptions } from "../QuestionForm/QuestionForm";
import { Tag } from "../Tag/Tag";
import { TextInput } from "../TextInput/TextInput";

type DeckFormProps = {
  deck?: z.infer<typeof deckSchema>;
  tags: TagType[];
  campaigns: Campaign[];
  action: (
    data: z.infer<typeof deckSchema>,
  ) => Promise<{ errorMessage?: string } | void>;
};

export default function DeckForm({
  deck,
  tags,
  campaigns,
  action,
}: DeckFormProps) {
  const { errorToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
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
          file: [],
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const [selectedTagIds, setSelectedTagIds] = useState(deck?.tagIds ?? []);

  const file = watch("file")?.[0];
  const deckImage = watch("imageUrl");
  const deckPreviewUrl = !!file ? URL.createObjectURL(file!) : deckImage;

  const onSubmit = handleSubmit(async (data) => {
    const questions = await Promise.all(
      data.questions.map(async (question) => {
        let imageUrl = question.imageUrl || "";

        if (question.file?.[0]) {
          imageUrl = await uploadImageToS3Bucket(question.file[0]);
        }

        return {
          ...question,
          imageUrl,
          file: undefined,
        };
      }),
    );

    let imageUrl = deckPreviewUrl || "";

    if (data.file?.[0]) {
      imageUrl = await uploadImageToS3Bucket(data.file[0]);
    }

    console.log({ imageUrl });

    const result = await action({
      ...data,
      questions,
      tagIds: selectedTagIds,
      campaignId: data.campaignId,
      id: deck?.id,
      imageUrl,
      file: undefined,
    });

    if (result?.errorMessage) {
      errorToast("Failed to save deck", result.errorMessage);
    }
  });

  useEffect(() => {
    const errorMessages = Object.values(errors)
      .map((error) => error.message!)
      .filter((val) => !!val);

    const questionErrors = errors.questions?.map!(
      (q) => q?.root?.message!,
    ).filter((val) => !!val);

    if (!!questionErrors?.length) {
      questionErrors.forEach((message) => errorToast(message));
    }

    if (!!errorMessages.length) {
      errorMessages.forEach((message) => errorToast(message));
    }
  }, [errors]);

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-3xl mb-3">
        {deck ? `Edit deck #${deck.id}` : "Create deck"}
      </h1>
      <div className="mb-3">
        <label className="block mb-1">Deck title</label>
        <TextInput variant="secondary" {...register("deck")} />
        <div className="text-red">{errors.deck?.message}</div>
      </div>
      <div className="my-10">
        <div className="mb-3">
          <label className="block mb-1">Image URL (optional)</label>
          {!!deckPreviewUrl && (
            <div className="w-[77px] h-[77px] relative overflow-hidden rounded-lg">
              <Image
                fill
                alt="preview-image-campaign"
                src={deckPreviewUrl}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            {!!deckPreviewUrl && (
              <Button
                type="button"
                onClick={() => {
                  setValue("file", []);
                  setValue("imageUrl", undefined);
                }}
                variant="warning"
                className="!w-fit !h-[30px]"
              >
                Remove
              </Button>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              {...register("file")}
            />
            <div className="text-red">
              {errors.questions && errors.file?.message}
            </div>{" "}
          </div>
        </div>
        <div className="mb-3">
          <label className="block mb-1">Description (optional)</label>
          <textarea
            className="border-[1px] py-3 px-4 focus:border-aqua focus:outline-none focus:shadow-input focus:shadow-[#6DECAFCC] rounded-md text-xs w-full text-input-gray border-gray min-h-20"
            {...register("description")}
          />
          <div className="text-red">{errors.description?.message}</div>
        </div>
        <div className="mb-3">
          <label className="block mb-1">Footer (optional)</label>
          <textarea
            className="border-[1px] py-3 px-4 focus:border-aqua focus:outline-none focus:shadow-input focus:shadow-[#6DECAFCC] rounded-md text-xs w-full text-input-gray border-gray min-h-20"
            {...register("footer")}
          />{" "}
          <div className="text-red">{errors.footer?.message}</div>
        </div>
      </div>
      <div className="mb-3">
        {fields.map((_, questionIndex) => {
          {
            const file = watch(`questions.${questionIndex}.file`)?.[0];
            const image = watch(`questions.${questionIndex}.imageUrl`);
            const previewUrl = !!file ? URL.createObjectURL(file!) : image;

            return (
              <fieldset
                name={`questions.${questionIndex}`}
                key={`questions.${questionIndex}`}
              >
                <h2 className="text-xl mb-2">Question #{questionIndex + 1}</h2>

                <div className="text-red">
                  {errors.questions && errors.questions[questionIndex]?.message}
                </div>

                <div className="mb-3">
                  <label className="block mb-1">Question statement</label>
                  <TextInput
                    variant="secondary"
                    {...register(`questions.${questionIndex}.question`)}
                  />
                  <div className="text-red">
                    {errors.questions &&
                      errors.questions[questionIndex]?.question?.message}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block mb-1">Type</label>
                  <select
                    className="text-gray-800"
                    {...register(`questions.${questionIndex}.type`, {
                      onChange: (e) => {
                        setValue(
                          `questions.${questionIndex}.questionOptions`,
                          getDefaultOptions(e.target.value),
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

                <div className="mb-3">
                  <label className="block mb-1">Image URL (optional)</label>
                  {!!previewUrl && (
                    <div className="w-32 h-32 relative overflow-hidden rounded-full">
                      <Image
                        fill
                        alt="preview-image-campaign"
                        src={previewUrl}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mt-2">
                    {!!previewUrl && (
                      <Button
                        type="button"
                        onClick={() => {
                          setValue(`questions.${questionIndex}.file`, []);
                          setValue(
                            `questions.${questionIndex}.imageUrl`,
                            undefined,
                          );
                        }}
                        variant="warning"
                        className="!w-fit !h-[30px]"
                      >
                        Remove
                      </Button>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      {...register(`questions.${questionIndex}.file`)}
                    />
                    <div className="text-red">
                      {errors.questions &&
                        errors.questions[questionIndex]?.file?.message}
                    </div>{" "}
                  </div>
                </div>

                <div className="mb-3 flex flex-col gap-2">
                  <label className="block">Options</label>
                  {Array(
                    watch(`questions.${questionIndex}.type`) ===
                      QuestionType.MultiChoice
                      ? 4
                      : 2,
                  )
                    .fill(null)
                    .map((_, optionIndex) => (
                      <div key={`${questionIndex}-${optionIndex}`}>
                        <div className="flex gap-4">
                          <div className="w-1/4">
                            <TextInput
                              variant="secondary"
                              {...register(
                                `questions.${questionIndex}.questionOptions.${optionIndex}.option`,
                              )}
                            />
                          </div>
                          <div className="w-28 flex justify-center items-center gap-2">
                            <div>is correct?</div>
                            <input
                              type="checkbox"
                              {...register(
                                `questions.${questionIndex}.questionOptions.${optionIndex}.isCorrect`,
                              )}
                            />
                          </div>
                          {watch(`questions.${questionIndex}.type`) ===
                            QuestionType.BinaryQuestion && (
                            <div className="w-24 flex justify-center items-center gap-2 relative">
                              <div>is left?</div>
                              <input
                                type="checkbox"
                                {...register(
                                  `questions.${questionIndex}.questionOptions.${optionIndex}.isLeft`,
                                )}
                              />
                            </div>
                          )}
                        </div>
                        <div className="text-red">
                          {errors.questions &&
                            errors.questions[questionIndex]?.questionOptions &&
                            errors.questions[questionIndex]?.questionOptions![
                              optionIndex
                            ]?.option?.message}
                        </div>
                      </div>
                    ))}
                </div>

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
              </fieldset>
            );
          }
        })}

        {fields.length < 20 && (
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              append({
                type: fields[fields.length - 1].type,
                question: "",
                questionOptions: getDefaultOptions(
                  fields[fields.length - 1].type,
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
        <select className="text-gray-800" {...register("revealToken")}>
          {Object.values(Token).map((token) => (
            <option value={token} key={token}>
              {token}
            </option>
          ))}
        </select>
        <div className="text-red">{errors.revealToken?.message}</div>
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
        <div className="text-red">{errors.revealTokenAmount?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Reveal at date (optional)</label>
        <span className="block mb-1">
          In UTC: <b>{watch("revealAtDate")?.toISOString()}</b>
        </span>
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
        <div className="text-red">{errors.revealAtDate?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">
          Active from date (for non daily decks)
        </label>
        <span className="block mb-1">
          In UTC: <b>{watch("activeFromDate")?.toISOString()}</b>
        </span>
        <Controller
          name="activeFromDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              showIcon
              selected={field.value}
              onChange={field.onChange}
              placeholderText="Active from date"
              showTimeInput
              dateFormat="Pp"
              isClearable
            />
          )}
        />
        <div className="text-red">{errors.activeFromDate?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Daily deck date (optional)</label>
        <span className="block mb-1">
          In UTC: <b>{watch("date")?.toISOString()}</b>
        </span>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              showIcon
              selected={field.value}
              onChange={field.onChange}
              placeholderText="Daily deck date"
              showTimeInput
              dateFormat="Pp"
            />
          )}
        />
        <div className="text-red">{errors.date?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Reveal at answer count (optional)</label>
        <TextInput
          variant="secondary"
          {...register("revealAtAnswerCount", {
            setValueAs: (v) => (!v ? null : parseInt(v)),
          })}
        />
        <div className="text-red">{errors.revealAtAnswerCount?.message}</div>
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
      <div className="mb-4">
        <label className="block mb-1">Campaign (optional)</label>
        <select
          className="text-gray-800"
          {...register("campaignId", {
            setValueAs: (v) => (!v ? null : parseInt(v)),
          })}
        >
          {campaigns.map((campaign) => (
            <option value={Number(campaign.id)} key={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>
      <Button
        variant="primary"
        type="submit"
        disabled={isSubmitting || isSubmitSuccessful}
      >
        {isSubmitting ? "Submitting" : "Submit"}
      </Button>{" "}
    </form>
  );
}
