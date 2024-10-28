import { z } from "zod";

import { tagSchema } from "../schemas/tag";
import prisma from "../services/prisma";

export async function getTags() {
  const tags = await prisma.tag.findMany();

  return tags;
}

export async function getTagSchema(
  id: number,
): Promise<z.infer<typeof tagSchema> | null> {
  const tag = await prisma.tag.findUnique({
    where: {
      id,
    },
  });

  if (!tag) {
    return null;
  }

  return tag;
}
