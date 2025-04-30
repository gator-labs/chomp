import { z } from "zod";

const OptionSchema = z.object({
  title: z.string().min(1),
  index: z.number().int().positive(),
});

export const questionSchema = z
  .object({
    title: z.string().min(1),
    options: z
      .array(OptionSchema)
      .length(2)
      .or(z.array(OptionSchema).length(4)),
    rules: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    startAt: z.date().optional(),
    resolvesAt: z.date().optional(),
    onChainAddress: z.string().optional(),
  })
  .refine(
    (data) =>
      !(data.resolvesAt && data.startAt) ||
      data.resolvesAt > data.startAt,
    {
      message: "resolvesAt must be after startAt",
      path: ["resolvesAt"],
    },
  );
