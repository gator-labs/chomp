import { QuestionType } from "@prisma/client";
import { z } from "zod";

import {
  IMAGE_UPLOAD_SIZES,
  IMAGE_UPLOAD_SIZE_STRINGS,
  IMAGE_VALID_TYPES,
} from "../constants/images";

export const askQuestionSchema = z.object({
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
      id: z.number().optional(),
      option: z.string().min(1),
      isCorrect: z.boolean().optional(),
      isLeft: z.boolean(),
    })
    .array(),
});
