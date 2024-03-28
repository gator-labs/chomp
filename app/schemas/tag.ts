import { z } from "zod";

export const tagSchema = z.object({
  id: z.number().optional(),
  tag: z.string({
    invalid_type_error: "Invalid question",
    required_error: "Tag is required",
  }),
});
