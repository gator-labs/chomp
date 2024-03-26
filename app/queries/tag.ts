import prisma from "../services/prisma";

export async function getTags() {
  const tags = await prisma.tag.findMany();

  return tags;
}
