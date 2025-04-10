import { QuestionType } from "@prisma/client";
import { z } from "zod";

import {
  IMAGE_UPLOAD_SIZES,
  IMAGE_UPLOAD_SIZE_STRINGS,
  IMAGE_VALID_TYPES,
} from "../constants/images";

export const MIN_QUESTION_LENGTH = 5;
export const MIN_OPTION_LENGTH = 1;

export const MAX_QUESTION_LENGTH = 120;
export const MAX_OPTION_LENGTH = 120;

export const askQuestionSchema = z.object({
  question: z
    .string({
      invalid_type_error: "Invalid question",
      required_error: "Question is required",
    })
    .min(MIN_QUESTION_LENGTH)
    .max(MAX_QUESTION_LENGTH),
  type: z.nativeEnum(QuestionType),
  file: z
    .custom<File[]>()
    .optional()
    .refine((files) => {
      if (files && files.length > 0) {
        return files[0].size <= IMAGE_UPLOAD_SIZES.MEDIUM;
      }
      return true;
    }, `Max image size allowed is ${IMAGE_UPLOAD_SIZE_STRINGS.MEDIUM}.`)
    .refine((files) => {
      if (files && files.length > 0) {
        return IMAGE_VALID_TYPES.includes(files[0].type);
      }
      return true;
    }, "Only .jpg, .jpeg, .png and .webp formats are supported."),
  questionOptions: z
    .object({
      option: z.string().min(MIN_OPTION_LENGTH).max(MAX_OPTION_LENGTH),
    })
    .array(),
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
});
