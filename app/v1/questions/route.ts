import { questionSchema } from "@/app/schemas/v1/question";
import prisma from "@/app/services/prisma";
import { QuestionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  // parse backend-secret and source headers
  const backendSecret = request.headers.get("backend-secret");
  if (backendSecret !== process.env.BACKEND_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // source corresponds to Zuplo -> Services -> API Key Service -> select consumer -> metadata -> source
  const source = request.headers.get("source");

  const data = await request.json();

  try {
    const validation = questionSchema.safeParse(data);

    if (!validation.success) {
      const issues = validation.error.issues;
      for (const issue of issues) {
        // Option errors
        if (issue.path[0] === "options") {
          return NextResponse.json(
            {
              error: "option_invalid",
              message: issue.message,
            },
            { status: 400 },
          );
        }
        // Title missing
        if (issue.path[0] === "title") {
          return NextResponse.json(
            { error: "question_invalid", message: "Title must be defined" },
            { status: 400 },
          );
        }
        // resolveAt after activeAt
        if (
          issue.path[0] === "resolveAt" &&
          issue.message.includes("resolveAt must be after activeAt")
        ) {
          return NextResponse.json(
            {
              error: "question_invalid",
              message: "resolveAt must be after activeAt",
            },
            { status: 400 },
          );
        }
      }
      // Fallback
      return NextResponse.json(
        { error: "question_invalid", message: "Invalid question data" },
        { status: 400 },
      );
    }

    const {
      title,
      description,
      options,
      resolveAt,
      activeAt,
      imageUrl,
      rules,
      onChainAddress,
    } = validation.data || {};

    const mapOptions =
      options?.map((op) => ({
        option: op.title,
        index: op.index,
      })) ?? [];

    const res = await prisma.question.create({
      data: {
        uuid: uuidv4(),
        question: title,
        description: description,
        type:
          options?.length === 2
            ? QuestionType.BinaryQuestion
            : QuestionType.MultiChoice,
        revealAtDate: resolveAt,
        activeFromDate: activeAt,
        imageUrl: imageUrl,
        rules: rules,
        onChainAddress: onChainAddress,
        source: source,
        questionOptions: {
          createMany: {
            data: mapOptions,
          },
        },
      },
      include: {
        questionOptions: {
          select: {
            index: true,
            uuid: true,
          },
        },
      },
    });

    return NextResponse.json({
      questionId: res.uuid,
      options: res.questionOptions.map(({ index, uuid }) => ({
        index,
        optionId: uuid,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
