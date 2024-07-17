import { z } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string({
      required_error: "First name is required",
    })
    .min(2)
    .max(20)
    .nullish(),
  lastName: z.string().max(20).nullish(),
  username: z
    .string({
      required_error: "Username is required",
    })
    .min(2)
    .nullish(),
});
