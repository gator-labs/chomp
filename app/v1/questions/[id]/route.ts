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
        calculatedIsCorrect: true,
        score: true,
        option: true,
      },
    });

    const correctAnswer = questionOptions.find((option) => option.calculatedIsCorrect);

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
