import { z } from "zod";

export const profileSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(3).nullish(),
  lastName: z.string().min(3).nullish(),
  username: z.string().min(2).nullish(),
});
