import { z } from "zod";

const QuestionIdSchema = z.string().uuid();

export const UpdateQuestionSchema = z.object({
  resolvesAt: z.coerce.date().optional().nullable(),
});

export const UpdateQuestionParamsSchema = z.object({
  params: z.object({
    id: QuestionIdSchema,
  }),
});

export type UpdateQuestionParams = z.infer<typeof UpdateQuestionParamsSchema>;

export type UpdateQuestion = z.infer<typeof UpdateQuestionSchema>;
