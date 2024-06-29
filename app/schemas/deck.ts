import { QuestionType, Token } from "@prisma/client";
import { z } from "zod";

export const deckSchema = z.object({
  id: z.number().optional(),
  deck: z.string().min(5),
  imageUrl: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid URL" },
    ),
  tagIds: z.number().array().default([]),
  revealToken: z.nativeEnum(Token),
  date: z.date().nullish(),
  revealTokenAmount: z.number().min(0),
  revealAtDate: z.date().nullish(),
  revealAtAnswerCount: z.number().min(0).nullish(),
  isActive: z.boolean(),
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
      imageUrl: z
        .string()
        .optional()
        .nullable()
        .refine(
          (val) => {
            if (!val) return true;
            try {
              new URL(val);
              return true;
            } catch {
              return false;
            }
          },
          { message: "Invalid URL" },
        ),
      questionOptions: z
        .object({
          id: z.number().optional(),
          option: z.string().min(1),
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
          console.log({ isLeftCount });
          if (isLeftCount === 0 || isLeftCount === 2) {
            return false;
          } else {
            return true;
          }
        }
        return true;
      },
      { message: "Only one is left option is required in" },
    )
    .array(),
});
