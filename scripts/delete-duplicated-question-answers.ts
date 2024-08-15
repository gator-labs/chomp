import { PrismaClient } from "@prisma/client";

console.log("Loaded environment variables:");
console.log("DATABASE_PRISMA_URL:", process.env.DATABASE_PRISMA_URL);

const prisma = new PrismaClient();

async function main() {
  const duplicatedQuestionAnswersGroups: {
    userId: number;
    question_id: number;
    question_option_id: number;
    latest_date: string;
  }[] = await prisma.$queryRawUnsafe(
    `
    SELECT "QuestionAnswer"."userId", Q.id AS "question_id", QO.id AS "question_option_id", MAX("QuestionAnswer"."createdAt") AS "latest_date"
    FROM "QuestionAnswer"
        JOIN public."QuestionOption" QO ON "QuestionAnswer"."questionOptionId" = QO.id
        JOIN public."Question" Q ON Q.id = QO."questionId"
    WHERE "hasViewedButNotSubmitted" = FALSE
    GROUP BY "QuestionAnswer"."userId", QO.id, Q.id
    HAVING COUNT(Q.id) > 1
    ORDER BY latest_date DESC;
    `,
  );

  console.log(
    "Duplicated question answers groups:",
    duplicatedQuestionAnswersGroups,
  );

  for (const {
    userId,
    question_id,
    question_option_id,
  } of duplicatedQuestionAnswersGroups) {
    const duplicatedQuestionAnswers: {
      id: number;
      createdAt: string;
    }[] = await prisma.$queryRawUnsafe(
      `
         SELECT
            "QuestionAnswer".id AS id,
            "QuestionAnswer"."createdAt" AS createdAt
         FROM "QuestionAnswer"
          JOIN public."QuestionOption" QO ON QO.id = "QuestionAnswer"."questionOptionId" AND "questionOptionId" = ${question_option_id}
          JOIN public."Question" Q ON Q.id = QO."questionId" AND Q.ID = ${question_id}
        WHERE "userId" = '${userId}'
        `,
    );

    console.log("Duplicated question answers:", duplicatedQuestionAnswers);

    const latestElement = duplicatedQuestionAnswers.reduce(
      (latest, current) => {
        return new Date(latest.createdAt) > new Date(current.createdAt)
          ? latest
          : current;
      },
      duplicatedQuestionAnswers[0],
    );

    console.log("Latest element:", latestElement);

    // Step 2: Filter out other elements
    const elementsToDelete = duplicatedQuestionAnswers.filter(
      (element) => element.id !== latestElement.id,
    );

    console.log("Elements to delete:", elementsToDelete);

    // Step 3: Delete other elements
    await prisma.$queryRawUnsafe(
      `
            DELETE FROM "QuestionAnswer"
            WHERE id IN (${elementsToDelete.map((element) => element.id).join(",")})
        `,
    );

    // Step 4: Delete all legacy elements with hasViewedButNotSubmitted = true
    await prisma.$queryRawUnsafe(
      `
        DELETE FROM "QuestionAnswer" WHERE "hasViewedButNotSubmitted"  = true;
        `,
    );
  }

  // Add constraints to prevent this from happening again
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
