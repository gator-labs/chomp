import prisma from "@/app/services/prisma";
import "server-only";

export interface QuestionInfo {
  questionId: string;
  title: string;
  description: string | null;
  activeAt: Date | null;
  resolveAt: Date | null;
}

/**
 * Get Questions
 * Return an array with basic information about each question matching the provided source.
 * For more details, query questions individually through get question endpoint.
 */
export async function getQuestions(source: string): Promise<QuestionInfo[]> {
  const questions = await prisma.question.findMany({
    where: {
      source: source, // Filter by source
    },
    select: {
      uuid: true,
      question: true,
      description: true,
      activeFromDate: true,
      revealAtDate: true,
    },
    orderBy: {
      activeFromDate: "desc",
    },
  });

  return questions.map((q) => ({
    questionId: q.uuid,
    title: q.question,
    description: q.description,
    activeAt: q.activeFromDate,
    resolveAt: q.revealAtDate,
  }));
}
