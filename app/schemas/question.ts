import { QuestionType } from "@prisma/client";
import { z } from "zod";

export const questionSchema = z.object({
  question: z
    .string({
      invalid_type_error: "Invalid question",
      required_error: "Question is required",
    })
    .min(5),
  type: z.nativeEnum(QuestionType),
});
