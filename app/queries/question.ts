import prisma from "../services/prisma";

export async function getQuestions() {
  const questions = await prisma.question.findMany();

  return questions;
}