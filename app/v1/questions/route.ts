import { questionSchema } from "@/app/schemas/v1/question";
import prisma from "@/app/services/prisma";
import { QuestionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  const data = await request.json();
  // parse backend-secret and source headers
  const backendSecret = request.headers.get("backend-secret");
  if (backendSecret !== process.env.BACKEND_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // source corresponds to Zuplo -> Services -> API Key Service -> select consumer -> metadata -> source
  const source = request.headers.get("source");

  try {
    const validation = questionSchema.safeParse(data);

    if (!validation.success) {
      const issues = validation.error.issues;
      for (const issue of issues) {
        // Option errors
        if (issue.path[0] === "options") {
          if (issue.code === "too_small" || issue.code === "too_big") {
            return NextResponse.json(
              {
                error: "question_invalid",
                message: "Exactly 2 or 4 options must be provided",
              },
              { status: 400 },
            );
          }
          if (
            issue.path.length === 3 &&
            (issue.path[2] === "title" || issue.path[2] === "index")
          ) {
            return NextResponse.json(
              {
                error: "option_invalid",
                message: "Option missing title/index",
              },
              { status: 400 },
            );
          }
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
        questionOptions: true,
      },
    });

    return NextResponse.json({
      id: res.uuid,
      options: res.questionOptions,
    });
  } catch {
    return NextResponse.json({ status: "Internal Server Error" });
  }
}
