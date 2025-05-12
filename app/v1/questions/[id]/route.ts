import prisma from "@/app/services/prisma";
import { NextRequest, NextResponse } from "next/server";

interface QuestionAnswer {
  userId: string;
  selected: boolean;
  percentage: number | null;
  questionOption: { uuid: string };
  uuid: string;
  score: number | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // parse backend-secret and source headers
  const backendSecret = request.headers.get("backend-secret");
  if (backendSecret !== process.env.BACKEND_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // source corresponds to Zuplo -> Services -> API Key Service -> select consumer -> metadata -> source
  const source = request.headers.get("source");

  const { id } = params;

  try {
    const question = await prisma.question.findUnique({
      where: {
        uuid: id,
        source,
      },
    });

    if (question === null) {
      return NextResponse.json(
        {
          error: "question_not_found",
          message: "No question exists with this id and source",
        },
        { status: 404 },
      );
    }

    const questionOptions = await prisma.questionOption.findMany({
      where: {
        question: {
          uuid: id,
          source,
        },
      },
      select: {
        id: true,
        uuid: true,
        isCorrect: true,
        score: true,
      },
    });

    const correctAnswer = questionOptions.find((option) => option.isCorrect);

    const questionAnswers = await prisma.questionAnswer.findMany({
      where: {
        questionOptionId: {
          in: questionOptions.map((qo) => qo.id),
        },
        NOT: {
          percentage: null,
          selected: false,
        },
      },
      select: {
        userId: true,
        selected: true,
        percentage: true,
        uuid: true,
        score: true,
        questionOption: {
          select: {
            uuid: true,
            score: true,
          },
        },
      },
    });

    // Group answers by userId
    const groupedAnswersByUser: Record<string, QuestionAnswer[]> = {};

    for (const answer of questionAnswers) {
      if (!groupedAnswersByUser[answer.userId]) {
        groupedAnswersByUser[answer.userId] = [];
      }
      groupedAnswersByUser[answer.userId].push(answer);
    }
    // Transform and flatten into final array
    const transformedAnswers = Object.values(groupedAnswersByUser).map(
      (userAnswers) => {
        // Map each user's answers to the desired format, filter out empty/null
        const mappedAnswers = userAnswers
          .map((ua) => {
            const answer: any = {};
            if (ua.selected) {
              answer.firstOrderOptionId = ua.questionOption.uuid;
              answer.answerId = ua.uuid;
              answer.score = ua.score;
            }
            if (ua.percentage !== null) {
              answer.secondOrderOptionId = ua.questionOption.uuid;
              answer.secondOrderOptionEstimate = ua.percentage;
            }
            return Object.keys(answer).length > 0 ? answer : null;
          })
          .filter(Boolean);

        // Merge all mapped answers into a single object per user
        return Object.assign({}, ...mappedAnswers);
      },
    );

    return NextResponse.json({
      answers: transformedAnswers,
      options: questionOptions.map((qo) => ({
        optionId: qo.uuid,
        optionScore: qo.score,
      })),
      bestOption: correctAnswer?.uuid ? correctAnswer.uuid : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
