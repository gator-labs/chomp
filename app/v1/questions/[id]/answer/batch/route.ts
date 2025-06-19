import { AnswerBatchSchema } from "@/app/schemas/v1/answer";
import prisma from "@/app/services/prisma";
import { createDynamicUsers } from "@/lib/dynamic";
import { ApiAnswerInvalidError, ApiError } from "@/lib/error";
import { answerQuestion } from "@/lib/v1/answerQuestion";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

async function findOrCreateUsers(wallets: string[]) {
  const uniqueWallets = Array.from(new Set(wallets));

  const users = await prisma.wallet.findMany({
    where: { address: { in: uniqueWallets } },
  });

  const seenWallets = Object.fromEntries(
    users.map((user) => [user.address, user.userId]),
  );

  const unseenWallets = wallets.filter((wallet) => !(wallet in seenWallets));

  if (unseenWallets.length > 0) {
    const created = await createDynamicUsers(unseenWallets);

    const newUserIds = Object.keys(created);
    const newUserRecords = newUserIds.map((userId) => ({ id: userId }));
    const newWalletRecords = newUserIds.map((userId) => ({
      userId,
      address: created[userId],
    }));

    await prisma.$transaction(async (tx) => {
      await tx.user.createMany({
        data: newUserRecords,
      });

      await tx.wallet.createMany({
        data: newWalletRecords,
      });
    });

    return { ...seenWallets, ...created };
  }

  return seenWallets;
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
    const req = AnswerBatchSchema.safeParse(data);

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

    const wallets = req.data.map((answer) => answer.userAddress);

    const users = await findOrCreateUsers(wallets);

    const questionId = urlParams.data.params.id;

    const results = [];

    for (let i = 0; i < req.data.length; i++) {
      if (!users[req.data[i].userAddress]) {
        results.push({
          error: "user_invalid",
          errorMsg: "Could not find or create user account",
          success: false,
        });
        continue;
      }

      try {
        const uuid = await answerQuestion(
          users[req.data[i].userAddress],
          questionId,
          source,
          req.data[i].firstOrderOptionId,
          req.data[i].secondOrderOptionId,
          req.data[i].secondOrderOptionEstimate,
          req.data[i].weight ?? 1,
        );

        results.push({
          answerId: uuid,
          success: true,
        });
      } catch (e) {
        if (e instanceof ApiError) {
          results.push({
            success: false,
            error: e.error,
            errorMsg: e.message,
          });
        } else {
          throw e;
        }
      }
    }

    return NextResponse.json({
      answers: results,
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
