"use server";

import {
  ChompResult,
  Deck,
  DeckQuestion,
  Question,
  QuestionAnswer,
  QuestionOption,
} from "@prisma/client";
import { isAfter, isBefore } from "date-fns";
import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";

export async function getActiveAndInactiveCampaigns() {
  return prisma.campaign.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

export async function getActiveAndInactiveCampaign(campaignId: number) {
  return prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  });
}

export async function getCampaigns() {
  return prisma.campaign.findMany({
    where: {
      isVisible: true,
      isActive: true,
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function getCampaign(id: number) {
  const jwt = await getJwtPayload();

  const userId = jwt?.sub;

  return prisma.campaign.findUnique({
    where: {
      id,
    },
    include: {
      deck: {
        include: {
          deckQuestions: {
            include: {
              question: {
                include: {
                  chompResults: {
                    include: {
                      question: true,
                    },
                    where: {
                      userId,
                    },
                  },
                  questionOptions: {
                    include: {
                      questionAnswers: {
                        where: {
                          userId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getAllCampaigns() {
  const payload = await getJwtPayload();

  const userId = payload?.sub;

  const campaigns = await prisma.campaign.findMany({
    where: {
      isVisible: true,
    },
    include: {
      deck: {
        include: {
          deckQuestions: {
            include: {
              question: {
                include: {
                  chompResults: {
                    where: {
                      userId,
                    },
                  },
                  questionOptions: {
                    include: {
                      questionAnswers: {
                        where: {
                          userId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return campaigns.map((campaign) => ({
    ...campaign,
    decksToAnswer: !!userId ? getDecksToAnswer(campaign.deck) : undefined,
    decksToReveal: !!userId ? getDecksToReveal(campaign.deck) : undefined,
  }));
}

function getDecksToAnswer(
  decks: (Deck & {
    deckQuestions: (DeckQuestion & {
      question: Question & {
        questionOptions: (QuestionOption & {
          questionAnswers: QuestionAnswer[];
        })[];
      };
    })[];
  })[],
) {
  return decks.filter(
    (deck) =>
      isBefore(deck.activeFromDate!, new Date()) &&
      isAfter(deck.revealAtDate!, new Date()) &&
      deck.deckQuestions.flatMap((dq) => dq.question.questionOptions).length !==
        deck.deckQuestions.flatMap((dq) =>
          dq.question.questionOptions.flatMap((qo) => qo.questionAnswers),
        ).length,
  );
}

function getDecksToReveal(
  decks: (Deck & {
    deckQuestions: (DeckQuestion & {
      question: Question & {
        chompResults: ChompResult[];
      };
    })[];
  })[],
) {
  return decks.filter(
    (deck) =>
      isAfter(new Date(), deck.revealAtDate!) &&
      deck.deckQuestions.map((dq) => dq.question).length !==
        deck.deckQuestions.flatMap((dq) =>
          dq.question.chompResults.map((cr) => cr),
        ).length,
  );
}
