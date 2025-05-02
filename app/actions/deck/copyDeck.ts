"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getIsUserAdmin } from "../../queries/user";
import prisma from "../../services/prisma";

/* eslint-disable @typescript-eslint/no-unused-vars */

export async function copyDeck(deckId: number): Promise<number> {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
  });

  if (!deck) throw new Error("Deck not found");

  const deckQuestions = await prisma.deckQuestion.findMany({
    where: { deckId },
    include: {
      question: {
        include: {
          questionOptions: true,
          questionTags: true,
        },
      },
    },
  });

  let newDeckId: number | undefined = undefined;

  await prisma.$transaction(async (tx) => {
    const {
      id,
      createdAt,
      updatedAt,
      activeFromDate,
      revealAtDate,
      ...newDeck
    } = deck;

    newDeck.deck = "Copy of " + newDeck.deck;
    newDeck.imageUrl = null;

    const createdDeck = await tx.deck.create({ data: newDeck });

    for (const deckQuestion of deckQuestions) {
      const {
        id,
        question,
        questionId,
        createdAt,
        updatedAt,
        ...newDeckQuestion
      } = deckQuestion;
      const { questionOptions, questionTags, ...newQuestion } = question;

      newQuestion.revealAtDate = null;
      newQuestion.imageUrl = null;

      newDeckQuestion.deckId = createdDeck.id;

      const questionOptionsData = questionOptions.map((qo) => {
        const { questionId, id, createdAt, updatedAt, ...rest } = qo;
        return rest;
      });

      const questionTagsData = questionTags.map((qt) => {
        const { questionId, id, ...rest } = qt;
        return rest;
      });

      if (newQuestion) {
        const { id, uuid, ...newQuestionWithoutId } = newQuestion;
        const questionOptionsDataWithoutId = questionOptionsData.map(
          ({ uuid, ...rest }) => rest,
        );

        const newData = {
          ...newQuestionWithoutId,
          deckQuestions: { create: newDeckQuestion },
          questionOptions: { create: questionOptionsDataWithoutId },
          questionTags: { create: questionTagsData },
        };

        await tx.question.create({
          data: newData,
        });
      }
    }

    newDeckId = createdDeck.id;
  });

  revalidatePath("/admin/decks");

  if (!newDeckId) throw new Error("Deck not copied");

  return newDeckId;
}
