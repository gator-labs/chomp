import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

import { AnswerSchema } from "@/app/schemas/v1/answer";
import prisma from "@/app/services/prisma";
import { createDynamicUsers } from "@/lib/dynamic";
import {
  ApiAnswerInvalidError,
  ApiError,
  ApiUserInvalidError,
} from "@/lib/error";
import { answerQuestion } from "@/lib/v1/answerQuestion";

async function findOrCreateUser(wallet: string) {
  const user = await prisma.wallet.findFirst({ where: { address: wallet } });

  if (user) return user.userId;

  const created = await createDynamicUsers([wallet]);

  if (!created[wallet]) throw new Error("Error creating Dynamic user");

  const newUserId = created[wallet];

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        id: newUserId,
      },
    });

    await tx.wallet.create({
      data: {
        userId: newUserId,
        address: wallet,
      },
    });
  });

  return newUserId;
}

const QuestionIdSchema = z.string().uuid();

const AnswerQuestionParamsSchema = z.object({
  params: z.object({
    id: QuestionIdSchema,
  }),
});

type AnswerQuestionParams = z.infer<typeof AnswerQuestionParamsSchema>;

export async function POST(request: NextRequest, params: AnswerQuestionParams) {
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
    const req = AnswerSchema.safeParse(data);

    const urlParams = AnswerQuestionParamsSchema.safeParse(params);

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
      throw new ApiAnswerInvalidError("Answer data invalid");
    }

    const questionId = urlParams.data.params.id;

    let userId;

    try {
      userId = await findOrCreateUser(req.data.userAddress);
    } catch {
      throw new ApiUserInvalidError("Could not find or create user account");
    }

    const uuid = await answerQuestion(
      userId,
      questionId,
      source,
      req.data.firstOrderOptionId,
      req.data.secondOrderOptionId,
      req.data.secondOrderOptionEstimate,
      req.data.weight ?? 1,
    );

    return NextResponse.json({
      answerId: uuid,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { error: e.error, message: e.message },
        { status: 400 },
      );
    } else {
      Sentry.captureException(e);
      console.error("Error answering question:", e);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }
}
