import { QuestionType, Token } from "@prisma/client";
import { z } from "zod";

import {
  IMAGE_UPLOAD_SIZES,
  IMAGE_UPLOAD_SIZE_STRINGS,
  IMAGE_VALID_TYPES,
} from "../constants/images";

export const deckSchema = z
  .object({
    id: z.number().optional(),
    deck: z
      .string()
      .min(5, { message: "Deck name must be at least 5 characters long" }),
    heading: z
      .string()
      .min(5, { message: "Deck heading must be at least 5 characters long" })
      .optional()
      .nullish()
      .or(z.literal("")),
    file: z
      .custom<File[]>()
      .optional()
      .refine((files) => {
        if (files && files.length > 0) {
          return files[0].size <= IMAGE_UPLOAD_SIZES.DEFAULT;
        }
        return true;
      }, `Max image size allowed is ${IMAGE_UPLOAD_SIZE_STRINGS.DEFAULT}.`)
      .refine((files) => {
        if (files && files.length > 0) {
          return IMAGE_VALID_TYPES.includes(files[0].type);
        }
        return true;
      }, "Only .jpg, .jpeg, .png and .webp formats are supported."),
    authorImageFile: z
      .custom<File[]>()
      .optional()
      .refine((files) => {
        if (files && files.length > 0) {
          return files[0].size <= IMAGE_UPLOAD_SIZES.DEFAULT;
        }
        return true;
      }, `Max image size allowed is ${IMAGE_UPLOAD_SIZE_STRINGS.DEFAULT}.`)
      .refine((files) => {
        if (files && files.length > 0) {
          return IMAGE_VALID_TYPES.includes(files[0].type);
        }
        return true;
      }, "Only .jpg, .jpeg, .png and .webp formats are supported."),
    imageUrl: z
      .string()
      .optional()
      .nullable()
      .refine(
        (value) => {
          if (!value) return true;

          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        {
          message: "Invalid image source",
        },
      ),
    description: z
      .string()
      .min(5, {
        message: "Deck description must be at least 5 characters long",
      })
      .optional()
      .nullish()
      .or(z.literal("")),
    author: z
      .string()
      .trim()
      .min(2, { message: "Author name must be at least 2 characters long" })
      .refine((value) => value.trim().length > 0, {
        message: "Author name cannot be empty or consist solely of spaces",
      })
      .optional()
      .nullish()
      .or(z.literal("")),
    authorImageUrl: z
      .string()
      .optional()
      .nullable()
      .refine(
        (value) => {
          if (!value) return true;

          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        {
          message: "Invalid image source",
        },
      ),
    footer: z.string().min(5).max(50).optional().nullish().or(z.literal("")),
    tagIds: z.number().array().default([]),
    stackId: z.number().optional().nullish(),
    revealToken: z.nativeEnum(Token),
    date: z.date().nullish(),
    activeFromDate: z.date().nullish(),
    revealTokenAmount: z.number().min(0),
    revealAtDate: z.date({ message: "Reveal at date is required" }),
    revealAtAnswerCount: z.number().min(0).nullish(),
    creditCostPerQuestion: z
      .number()
      .min(0)
      .max(Number(process.env.MAX_CREDIT_COST_PER_QUESTION ?? 100))
      .nullish(),
    questions: z
      .object({
        id: z.number().optional(),
        question: z
          .string({
            invalid_type_error: "Invalid question",
            required_error: "Question is required",
          })
          .min(5),
        type: z.nativeEnum(QuestionType),
        file: z
          .custom<File[]>()
          .optional()
          .refine((files) => {
            if (files && files.length > 0) {
              return files[0].size <= IMAGE_UPLOAD_SIZES.DEFAULT;
            }
            return true;
          }, `Max image size allowed is ${IMAGE_UPLOAD_SIZE_STRINGS.DEFAULT}.`)
          .refine((files) => {
            if (files && files.length > 0) {
              return IMAGE_VALID_TYPES.includes(files[0].type);
            }
            return true;
          }, "Only .jpg, .jpeg, .png and .webp formats are supported."),
        imageUrl: z
          .string()
          .optional()
          .nullable()
          .refine(
            (value) => {
              if (!value) return true;

              try {
                new URL(value);
                return true;
              } catch {
                return false;
              }
            },
            {
              message: "Invalid image source",
            },
          ),
        questionOptions: z
          .object({
            id: z.number().optional(),
            option: z.string().min(1).max(40),
            isCorrect: z.boolean().optional(),
            isLeft: z.boolean(),
          })
          .array(),
      })
      .refine(
        (q) => {
          if (q.type === QuestionType.BinaryQuestion) {
            const isLeftCount = q.questionOptions.filter(
              (option) => option.isLeft,
            ).length;

            if (isLeftCount === 0 || isLeftCount === 2) {
              return false;
            } else {
              return true;
            }
          }
          return true;
        },
        { message: "Only one is left option is required in binary questions" },
      )
      .array(),
  })
  .refine((data) => !(data.date && data.activeFromDate), {
    message: "Only one of 'date' or 'activeFromDate' can be selected",
  })
  .refine((data) => data.date || data.activeFromDate, {
    message: "'date' or 'activeFromDate' must be set",
  })
  .refine(
    (data) => {
      const comparisonDate = data.date ?? data.activeFromDate;
      return comparisonDate && data.revealAtDate >= comparisonDate;
    },
    {
      message: "'revealAtDate' cannot be before 'date' or 'activeFromDate'.",
    },
  );
