import { QuestionType } from "@prisma/client";
import { z } from "zod";

export const askQuestionSchema = z.object({
  id: z.number().optional(),
  question: z
    .string({
      invalid_type_error: "Invalid question",
      required_error: "Question is required",
    })
    .min(5),
  type: z.nativeEnum(QuestionType),
  questionOptions: z
    .object({
      id: z.number().optional(),
      option: z.string().min(1),
      isCorrect: z.boolean().optional(),
      isLeft: z.boolean(),
    })
    .array(),
});
