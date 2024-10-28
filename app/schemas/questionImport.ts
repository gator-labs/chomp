import { QuestionType } from "@prisma/client";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { z } from "zod";

dayjs.extend(customParseFormat);

export type QuestionImportModel = z.infer<typeof questionImportSchema>;

const questionImportSchemaBase = z.object({
  question: z
    .string({
      invalid_type_error: "Invalid question",
      required_error: "Question is required",
    })
    .min(5),
  revealAtDate: z
    .string()
    .nullish()
    .transform((value, ctx) => {
      if (!value) {
        return undefined;
      }

      const dayjsDate = dayjs(value, "DD/MM/YYYY");
      if (dayjsDate.isValid()) {
        return dayjsDate.toDate();
      }

      ctx.addIssue({
        code: "invalid_date",
        message: "Format of date should me DD/MM/YYYY HH:mm (day/month/year)",
      });
      return undefined;
    }),
  revealAtAnswerCount: z
    .string()
    .nullish()
    .transform((value, ctx) => {
      if (!value) {
        return undefined;
      }

      const valueNumber = +value;

      if (valueNumber < 0) {
        ctx.addIssue({
          code: "too_small",
          minimum: 0,
          type: "number",
          inclusive: true,
        });
      }

      return valueNumber;
    }),
  revealTokenAmount: z
    .string()
    .nullish()
    .transform((value, ctx) => {
      if (!value) {
        return undefined;
      }

      const valueNumber = +value;

      if (valueNumber < 0) {
        ctx.addIssue({
          code: "too_small",
          minimum: 0,
          type: "number",
          inclusive: true,
        });
      }

      return valueNumber;
    }),
  imageUrl: z.string().nullish(),
});

export const questionImportSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal(QuestionType.BinaryQuestion),
      binaryLeftOption: z.string().min(1),
      binaryRightOption: z.string().min(1),
      optionTrue: z
        .string()
        .nullish()
        .transform((value, ctx) => {
          if (!value) {
            return undefined;
          }

          const valueNumber = +value;

          if (valueNumber < 1) {
            ctx.addIssue({
              code: "too_small",
              minimum: 1,
              type: "number",
              inclusive: true,
            });
          }

          if (valueNumber > 2) {
            ctx.addIssue({
              code: "too_big",
              maximum: 2,
              type: "number",
              inclusive: true,
            });
          }

          return valueNumber;
        }),
    })
    .merge(questionImportSchemaBase),
  z
    .object({
      type: z.literal(QuestionType.MultiChoice),
      multipleChoiceOptionOne: z.string().min(1),
      multipleChoiceOptionTwo: z.string().min(1),
      multipleChoiceOptionThree: z.string().min(1),
      multipleChoiceOptionFour: z.string().min(1),
      optionTrue: z
        .string()
        .nullish()
        .transform((value, ctx) => {
          if (!value) {
            return undefined;
          }

          const valueNumber = +value;

          if (valueNumber < 1) {
            ctx.addIssue({
              code: "too_small",
              minimum: 1,
              type: "number",
              inclusive: true,
            });
          }

          if (valueNumber > 4) {
            ctx.addIssue({
              code: "too_big",
              maximum: 4,
              type: "number",
              inclusive: true,
            });
          }

          return valueNumber;
        }),
    })
    .merge(questionImportSchemaBase),
]);
