import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { z } from "zod";

import { questionImportSchema } from "./questionImport";

dayjs.extend(customParseFormat);

export type DeckImportModel = z.infer<typeof deckImportSchema>;

export const deckImportSchema = z.intersection(
  questionImportSchema,
  z.object({
    deck: z
      .string({
        invalid_type_error: "Invalid question",
        required_error: "Question is required",
      })
      .min(5),
    dailyDate: z
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
          message: "Format of date time should me DD/MM/YYYY (day/month/year)",
        });
        return undefined;
      }),
    deckImageUrl: z.string().nullish(),
  }),
);
