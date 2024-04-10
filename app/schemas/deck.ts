import { QuestionType, Token } from "@prisma/client";
import { z } from "zod";

export const deckSchema = z.object({
  id: z.number().optional(),
  deck: z.string().min(5),
  imageUrl: z.string().nullable(),
  tagIds: z.number().array().default([]),
  revealToken: z.nativeEnum(Token),
  revealTokenAmount: z.number().min(0),
  revealAtDate: z.date().nullable(),
  revealAtAnswerCount: z.number().min(0).nullable(),
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
      questionOptions: z
        .object({
          id: z.number().optional(),
          option: z.string().min(1),
          isTrue: z.boolean().optional(),
        })
        .array(),
    })
    .array(),
});
