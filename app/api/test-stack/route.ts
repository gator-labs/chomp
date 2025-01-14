// import { getTotalNumberOfAnswersInDeck } from "@/app/actions/deck/deck";
// import { getIsUserAdmin } from "@/app/queries/user";
import prisma from "@/app/services/prisma";
import { getTotalNumberOfDeckQuestions } from "@/app/utils/question";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const userId = undefined;
  console.log(userId);
  const stack = await prisma.stack.findUnique({
    where: {
      id: 42,
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
                    select: {
                      _count: {
                        select: {
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
      },
    },
  });

  // const deckQuestions = stack.deck.flatMap((d) => d.deckQuestions);

  // const totalNumberOfCards = getTotalNumberOfDeckQuestions(deckQuestions);
  /* The line `const filePath = path.join(__dirname, `stackData${uuidv4()}New.json`);` is creating a
  file path for a new JSON file. */
  const filePath = path.join(__dirname, `stackData${uuidv4()}New.json`);

  const newStack = {
    ...stack,
    deck: [],
  };

  fs.writeFileSync(filePath, JSON.stringify(newStack, null, 2));

  return NextResponse.json({ message: "msg" });
}
