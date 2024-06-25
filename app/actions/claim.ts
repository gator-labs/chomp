"use server";

import { ResultType } from "@prisma/client";
import { Keypair, PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { acquireMutex } from "../utils/mutex";

import { sendBonk } from "../utils/bonk";
import { getJwtPayload } from "./jwt";

export async function claimDeck(deckId: number) {
  const decks = await claimDecks([deckId]);
  return decks ? decks[0] : null;
}

export async function claimQuestion(questionId: number) {
  const questions = await claimQuestions([questionId]);
  return questions ? questions[0] : null;
}

export async function claimDecks(deckIds: number[]) {
  const questions = await prisma.deckQuestion.findMany({
    where: {
      deckId: {
        in: deckIds,
      },
    },
  });

  return await claimQuestions(questions.map((q) => q.questionId));
}

export async function claimAllAvailable() {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const revealedChompResults = await prisma.chompResult.findMany({
    where: {
      userId: payload.sub,
      result: "Revealed",
      questionId: { not: null },
    },
    select: {
      questionId: true,
    },
  });

  const questionIds = revealedChompResults.map((rcp) => rcp.questionId ?? 0); // Nulls are filtered in query

  return await claimQuestions(questionIds);
}

export async function claimQuestions(questionIds: number[]) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const release = await acquireMutex({
    identifier: "CLAIM",
    data: { userId: payload.sub },
  });

  try {
    const chompResults = await prisma.chompResult.findMany({
      where: {
        userId: payload.sub,
        questionId: {
          in: questionIds,
        },
        result: ResultType.Revealed,
      },
    });

    const userWallet = await prisma.wallet.findFirst({
      where: {
        userId: payload.sub,
      },
    });

    if (!userWallet) {
      return;
    }

    const treasuryWallet = Keypair.fromSecretKey(
      base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY || ""),
    );

    const tokenAmount = chompResults.reduce(
      (acc, cur) => acc + (cur.rewardTokenAmount?.toNumber() ?? 0),
      0,
    );

    let sendTx: string | null = null;
    if (tokenAmount > 0) {
      sendTx = await sendBonk(
        treasuryWallet,
        new PublicKey(userWallet.address),
        Math.round(tokenAmount * 10 ** 5),
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.chompResult.updateMany({
        where: {
          id: {
            in: chompResults.map((r) => r.id),
          },
        },
        data: {
          result: ResultType.Claimed,
          sendTransactionSignature: sendTx,
        },
      });

      const decks = await tx.deck.findMany({
        where: {
          deckQuestions: {
            every: {
              question: {
                chompResults: {
                  some: {
                    userId: payload.sub,
                    result: ResultType.Revealed,
                  },
                },
              },
            },
          },
        },
        include: {
          chompResults: {
            where: {
              userId: payload.sub,
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
            userId: payload.sub,
            result: ResultType.Claimed,
            sendTransactionSignature: sendTx,
          })),
        });
      }
    });

    release();
    revalidatePath("/application");
    return sendTx;
  } catch (e) {
    console.log("Error while claiming question", e);
    release();
    throw e;
  }
}
