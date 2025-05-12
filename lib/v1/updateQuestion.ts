import { UpdateQuestion } from "@/app/schemas/v1/update";
import prisma from "@/app/services/prisma";
import "server-only";

import { ApiQuestionInvalidError } from "../error";

export async function updateQuestion(
  questionId: string,
  source: string,
  update: UpdateQuestion,
): Promise<void> {
  const now = new Date();

  const question = await prisma.question.findFirst({
    where: {
      uuid: questionId,
      source,
    },
  });

  if (!question) {
    throw new ApiQuestionInvalidError("There is no question with that ID");
  }

  if (update.resolvesAt && new Date(update.resolvesAt) <= now) {
    throw new ApiQuestionInvalidError("resolvesAt must be in the future");
  }

  if (
    update.resolvesAt &&
    question.activeFromDate &&
    new Date(update.resolvesAt) <= new Date(question.activeFromDate)
  ) {
    throw new ApiQuestionInvalidError("resolvesAt must be after activeDate");
  }

  // Nothing to do if value omitted
  if (update.resolvesAt === undefined) return;

  const rv = await prisma.question.updateMany({
    data: {
      revealAtDate: update.resolvesAt,
    },
    where: {
      id: question.id,
      // Enforced again here to protect against race
      ...(update.resolvesAt !== null
        ? {
            OR: [
              {
                activeFromDate: {
                  lt: update.resolvesAt,
                },
              },
              { activeFromDate: null },
            ],
          }
        : null),
    },
  });

  if (rv.count === 0) throw new ApiQuestionInvalidError("Question not updated");
}
