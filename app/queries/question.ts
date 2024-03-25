import prisma from "../services/prisma";

export async function getQuestions() {
  const questions = await prisma.question.findMany();

  return questions;
}

export async function getQuestion(id: number) {
  const question = await prisma.question.findUnique({
    where: {
      id,
    },
  });

  return question;
}
