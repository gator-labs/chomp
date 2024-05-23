import { QuestionType, Token } from "@prisma/client";
import { z } from "zod";

export const deckSchema = z.object({
  id: z.number().nullish(),
  deck: z.string().min(5),
  imageUrl: z.string().nullish(),
  tagIds: z.number().array().default([]),
  revealToken: z.nativeEnum(Token),
  date: z.date().nullish(),
  revealTokenAmount: z.number().min(0),
  revealAtDate: z.date().nullish(),
  revealAtAnswerCount: z.number().min(0).nullish(),
  isActive: z.boolean(),
  questions: z
    .object({
      id: z.number().nullish(),
      question: z
        .string({
          invalid_type_error: "Invalid question",
          required_error: "Question is required",
        })
        .min(5),
      type: z.nativeEnum(QuestionType),
      questionOptions: z
        .object({
          id: z.number().nullish(),
          option: z.string().min(1),
          isCorrect: z.boolean().nullish(),
          isLeft: z.boolean(),
        })
        .array(),
    })
    .array(),
});
