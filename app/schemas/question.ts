import { QuestionType, Token } from "@prisma/client";
import { z } from "zod";

export const questionSchema = z.object({
  id: z.number().optional(),
  question: z
    .string({
      invalid_type_error: "Invalid question",
      required_error: "Question is required",
    })
    .min(5),
  type: z.nativeEnum(QuestionType),
  revealToken: z.nativeEnum(Token),
  revealTokenAmount: z.number().min(0),
  revealAtDate: z.date().nullable(),
  revealAtAnswerCount: z.number().min(0).nullable(),
  tagIds: z.number().array().default([]),
  questionOptions: z
    .object({
      id: z.number().optional(),
      option: z.string().min(1),
      isCorrect: z.boolean().optional(),
      isLeft: z.boolean(),
    })
    .array(),
});
