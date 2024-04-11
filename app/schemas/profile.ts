import { z } from "zod";

export const profileSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(3).optional(),
  lastName: z.string().min(3).optional(),
  username: z.string().min(2).optional(),
});
