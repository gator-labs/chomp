"use server";

import { ChompResult, ResultType } from "@prisma/client";
import { Keypair, PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { ONE_MINUTE_IN_MILLISECONDS } from "../utils/dateUtils";
import { acquireMutex } from "../utils/mutex";

import { sendBonk } from "../utils/bonk";
import { getJwtPayload } from "./jwt";

export async function claimDeck(deckId: number) {
  console.log("claim deck fired with id ", deckId);

  const decks = await claimDecks([deckId]);
  return decks ? decks[0] : null;
}

export async function claimQuestion(questionId: number) {
  console.log("claim questions fired");
  const questions = await claimQuestions([questionId]);
  return questions ? questions[0] : null;
}

export async function claimDecks(deckIds: number[]) {
  console.log("claim decks fired with deck ids ", deckIds);

  const questions = await prisma.deckQuestion.findMany({
    where: {
      deckId: {
        in: deckIds,
      },
    },
  });

  return await claimQuestions(questions.map((q) => q.questionId));
}

export async function getClaimableQuestionIds(): Promise<number[]> {
  const payload = await getJwtPayload();

  if (!payload) {
    return [];
  }

  const claimableQuestions = await prisma.chompResult.findMany({
    where: {
      userId: payload.sub,
      result: "Revealed",
      burnTransactionSignature: {
        not: null,
      },
      questionId: { not: null },
      rewardTokenAmount: {
        gt: 0,
      },
    },
    select: {
      questionId: true,
    },
  });

  return claimableQuestions.map(
    (claimableQuestion) => claimableQuestion.questionId!,
  );
}

export async function getAllRevealableQuestions() {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const revealableQuestionsAndAmount = await prisma.chompResult.findMany({
    where: {
      userId: payload.sub,
      result: "Revealed",
      questionId: { not: null },
    },
    select: {
      questionId: true,
      rewardTokenAmount: true,
      burnTransactionSignature: true,
    },
  });

  return revealableQuestionsAndAmount;
}

export async function claimAllAvailable() {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const claimableQuestionIds = await getClaimableQuestionIds();

  if (!claimableQuestionIds.length) throw new Error("No claimable questions");

  await claimQuestions(claimableQuestionIds);
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

    await prisma.chompResult.updateMany({
      where: {
        id: {
          in: chompResults.map((r) => r.id),
        },
      },
      data: {
        result: ResultType.Claimed,
      },
    });

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

        // const questionIdsClaimed = chompResults.map((cr) => cr.questionId ?? 0);
        // We're querying dirty data in transaction so we need claimed questions
        // const decks = await tx.deck.findMany({
        //   where: {
        //     deckQuestions: {
        //       some: {
        //         questionId: {
        //           in: questionIdsClaimed,
        //         },
        //       },
        //       every: {
        //         question: {
        //           chompResults: {
        //             every: {
        //               userId: payload.sub,
        //               result: ResultType.Claimed,
        //             },
        //           },
        //         },
        //       },
        //     },
        //   },
        //   include: {
        //     chompResults: {
        //       where: {
        //         userId: payload.sub,
        //       },
        //     },
        //   },
        // });

        // const deckRevealsToUpdate = decks
        //   .filter((deck) => deck.chompResults && deck.chompResults.length > 0)
        //   .map((deck) => deck.id);

        // if (deckRevealsToUpdate.length > 0) {
        //   await tx.chompResult.updateMany({
        //     where: {
        //       deckId: { in: deckRevealsToUpdate },
        //     },
        //     data: {
        //       result: ResultType.Claimed,
        //       sendTransactionSignature: sendTx,
        //     },
        //   });
        // }

        // const deckRevealsToCreate = decks
        //   .filter(
        //     (deck) => !deck.chompResults || deck.chompResults.length === 0,
        //   )
        //   .map((deck) => deck.id);

        // if (deckRevealsToCreate.length > 0) {
        //   await tx.chompResult.createMany({
        //     data: deckRevealsToCreate.map((deckId) => ({
        //       deckId,
        //       userId: payload.sub,
        //       result: ResultType.Claimed,
        //       sendTransactionSignature: sendTx,
        //     })),
        //   });
        // }
      },
      {
        isolationLevel: "Serializable",
        timeout: ONE_MINUTE_IN_MILLISECONDS,
      },
    );

    release();
    revalidatePath("/application");
    return sendTx;
  } catch (e) {
    console.log("Error while claiming question", e);
    release();
    throw e;
  }
}

async function handleSendBonk(chompResults: ChompResult[], address: string) {
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
      new PublicKey(address),
      Math.round(tokenAmount * 10 ** 5),
    );
  }

  return sendTx;
}
