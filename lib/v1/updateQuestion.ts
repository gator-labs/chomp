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

  if (update.resolveAt && new Date(update.resolveAt) <= now) {
    throw new ApiQuestionInvalidError("resolveAt must be in the future");
  }

  if (
    update.resolveAt &&
    question.activeFromDate &&
    new Date(update.resolveAt) <= new Date(question.activeFromDate)
  ) {
    throw new ApiQuestionInvalidError("resolveAt must be after activeDate");
  }

  // Nothing to do if value omitted
  if (update.resolveAt === undefined) return;

  const rv = await prisma.question.updateMany({
    data: {
      revealAtDate: update.resolveAt,
    },
    where: {
      id: question.id,
      // Enforced again here to protect against race
      ...(update.resolveAt !== null
        ? {
            OR: [
              {
                activeFromDate: {
                  lt: update.resolveAt,
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
