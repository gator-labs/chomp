import prisma from "@/app/services/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ message: `address not supplied` });
  }

  const user = await prisma.user.findFirst({
    where: {
      wallets: {
        some: {
          address,
        },
      },
    },
  });

  if (!user) return;

  await prisma.questionAnswer.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.userDeck.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.questionAnswer.deleteMany({
    where: {
      questionOptionId: {
        in: [45, 46],
      },
      userId: user.id,
    },
  });

  await prisma.questionAnswer.createMany({
    data: [
      {
        userId: user.id,
        questionOptionId: 45,
        selected: true,
        percentage: 56,
      },
      {
        userId: user.id,
        questionOptionId: 46,
        selected: false,
        percentage: 44,
      },
    ],
  });

  await prisma.chompResult.deleteMany({
    where: {
      userId: user.id,
    },
  });

  return NextResponse.json({ message: `demo data resetted for ${address}` });
}
