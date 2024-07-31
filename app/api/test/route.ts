import prisma from "@/app/services/prisma";
import { ResultType } from "@prisma/client";

import { handleSendBonk } from "@/app/actions/claim";
import { ONE_MINUTE_IN_MILLISECONDS } from "@/app/utils/dateUtils";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId || Array.isArray(userId)) {
    return Response.json("userId parameter is required", { status: 400 });
  }

  const data = await req.json();
  console.log(data);

  const { questionIds, burnTx } = data;

  const chompResults = await prisma.chompResult.findMany({
    where: {
      userId: userId,
      questionId: {
        in: questionIds,
      },
      result: ResultType.Revealed,
    },
  });

  console.log(chompResults);

  const userWallet = await prisma.wallet.findFirst({
    where: {
      userId: userId,
    },
  });

  console.log(userWallet);

  if (!userWallet) {
    return;
  }

  const sendTx = await handleSendBonk(chompResults, userWallet.address);

  if (!sendTx) throw new Error("Send tx is missing");

  await prisma.$transaction(
    async (tx) => {
      await tx.chompResult.updateMany({
        where: {
          id: {
            in: chompResults.map((r) => r.id),
          },
        },
        data: {
          sendTransactionSignature: sendTx,
        },
      });

      const questionIdsClaimed = chompResults.map((cr) => cr.questionId ?? 0);
      // We're querying dirty data in transaction so we need claimed questions
      const decks = await tx.deck.findMany({
        where: {
          deckQuestions: {
            some: {
              questionId: {
                in: questionIdsClaimed,
              },
            },
            every: {
              question: {
                chompResults: {
                  every: {
                    userId: userId,
                    result: ResultType.Claimed,
                  },
                },
              },
            },
          },
        },
        include: {
          chompResults: {
            where: {
              userId: userId,
            },
          },
        },
      });

      const deckRevealsToUpdate = decks
        .filter((deck) => deck.chompResults && deck.chompResults.length > 0)
        .map((deck) => deck.id);

      if (deckRevealsToUpdate.length > 0) {
        await tx.chompResult.updateMany({
          where: {
            deckId: { in: deckRevealsToUpdate },
          },
          data: {
            result: ResultType.Claimed,
            sendTransactionSignature: sendTx,
          },
        });
      }

      const deckRevealsToCreate = decks
        .filter((deck) => !deck.chompResults || deck.chompResults.length === 0)
        .map((deck) => deck.id);

      if (deckRevealsToCreate.length > 0) {
        await tx.chompResult.createMany({
          data: deckRevealsToCreate.map((deckId) => ({
            deckId,
            userId: userId,
            result: ResultType.Claimed,
            sendTransactionSignature: sendTx,
          })),
        });
      }
    },
    {
      isolationLevel: "Serializable",
      timeout: ONE_MINUTE_IN_MILLISECONDS,
    },
  );

  return Response.json({ userWallet });
}
