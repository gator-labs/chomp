import {
  UpdateQuestionParams,
  UpdateQuestionParamsSchema,
  UpdateQuestionSchema,
} from "@/app/schemas/v1/update";
import prisma from "@/app/services/prisma";
import {
  ApiAnswerInvalidError,
  ApiError,
  ApiQuestionInvalidError,
} from "@/lib/error";
import { transformQuestionAnswers } from "@/lib/v1/transforQuestionAnswers";
import { updateQuestion } from "@/lib/v1/updateQuestion";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

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

  const { id: questionUuidFromParams } = params;

  try {
    const question = await prisma.question.findUnique({
      where: {
        uuid: questionUuidFromParams,
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

    // Use the integer ID of the question for the raw query
    const questionIdInt = question.id;
    // Prisma cannot handle scores with NaN values.
    // https://github.com/prisma/prisma/issues/3492
    // We must use a raw query, not primsa, to get the desired output
    const rawQuestionOptions: Array<{ id: number; uuid: string; calculatedIsCorrect: boolean | null; score: number | null; option: string }> = await prisma.$queryRaw`
      SELECT
        id,
        uuid,
        "calculatedIsCorrect",
        CASE WHEN score = 'NaN'::float THEN NULL ELSE score END AS score,
        option
      FROM "QuestionOption"
      WHERE "questionId" = ${questionIdInt};
    `;

    // Ensure the structure matches what the rest of the code expects, or adapt if necessary
    const questionOptions = rawQuestionOptions.map(opt => ({
      ...opt,
      // Prisma normally returns boolean for calculatedIsCorrect, ensure type consistency if it was nullable in DB
      calculatedIsCorrect: opt.calculatedIsCorrect === null ? null : Boolean(opt.calculatedIsCorrect),
      // Score is already number | null from the CASE statement
    }));

    const correctAnswer = questionOptions.find((option) => option.calculatedIsCorrect);

    const questionOptionIds = questionOptions.map((qo) => qo.id);

    let rawQuestionAnswers: Array<{
      userId: string;
      selected: boolean;
      percentage: number | null;
      uuid: string; // QuestionAnswer UUID
      qa_score: number | null; // QuestionAnswer score
      qo_uuid: string; // QuestionOption UUID
      qo_score: number | null; // QuestionOption score
    }> = [];

    if (questionOptionIds.length > 0) {
      rawQuestionAnswers = await prisma.$queryRaw`
        SELECT
          qa."userId",
          qa."selected",
          qa."percentage",
          qa."uuid",
          CASE WHEN qa."score" = 'NaN'::float THEN NULL ELSE qa."score" END AS qa_score,
          qo."uuid" AS qo_uuid,
          CASE WHEN qo."score" = 'NaN'::float THEN NULL ELSE qo."score" END AS qo_score
        FROM "QuestionAnswer" qa
        JOIN "QuestionOption" qo ON qa."questionOptionId" = qo.id
        WHERE qa."questionOptionId" IN (${Prisma.join(questionOptionIds)})
          AND NOT (qa."percentage" IS NULL AND qa."selected" = FALSE);
      `;
    }

    // Manually reconstruct the nested structure Prisma provided
    const questionAnswers = rawQuestionAnswers.map(rqa => ({
      userId: rqa.userId,
      selected: rqa.selected,
      percentage: rqa.percentage,
      uuid: rqa.uuid,
      score: rqa.qa_score,
      questionOption: {
        uuid: rqa.qo_uuid,
        score: rqa.qo_score,
      },
    }));

    const transformedAnswers = transformQuestionAnswers(questionAnswers);

    return NextResponse.json({
      title: question.question,
      description: question.description,
      type: question.type,
      resolveAt: question.revealAtDate,
      activeAt: question.activeFromDate,
      imageUrl: question.imageUrl,
      rules: question.rules,
      onChainAddress: question.onChainAddress,
      source: question.source,
      answers: transformedAnswers,
      options: questionOptions.map((qo) => ({
        optionId: qo.uuid,
        optionScore: qo.score,
        title: qo.option,
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

export async function PUT(request: NextRequest, params: UpdateQuestionParams) {
  const backendSecret = request.headers.get("backend-secret");

  if (!backendSecret || backendSecret !== process.env.BACKEND_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = request.headers.get("source");

  if (!source) {
    return Response.json(
      { error: "missing_source", message: "Missing source field" },
      { status: 400 },
    );
  }

  try {
    const data = await request.json();
    const req = UpdateQuestionSchema.safeParse(data);

    const urlParams = UpdateQuestionParamsSchema.safeParse(params);

    if (!urlParams.success) {
      throw new ApiAnswerInvalidError("Invalid question ID");
    }

    if (!req.success) {
      const issues = req.error.issues;
      for (const issue of issues) {
        throw new ApiAnswerInvalidError(
          `${issue.path[0]} is missing or invalid`,
        );
      }
      throw new ApiQuestionInvalidError("data invalid");
    }

    const questionId = urlParams.data.params.id;

    await updateQuestion(questionId, source, req.data);

    return NextResponse.json({
      success: true,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { error: e.error, message: e.message },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }
}
