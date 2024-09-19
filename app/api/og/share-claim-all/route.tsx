import prisma from "@/app/services/prisma";
import { ImageResponse } from "next/og";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const burnTx = searchParams.get('burnTx') || "hello world"

    const results = await prisma.chompResult.findMany({
        where: {
          burnTransactionSignature: {
            contains: burnTx,
          },
        },
    });

    const bonkClaimedRaw = results.reduce((sum, item) => sum + (item.rewardTokenAmount?.toNumber() || 0), 0);
    const bonkClaimed = Math.round(bonkClaimedRaw).toLocaleString("en-US")
    const numCorrect = results.filter(item => item.rewardTokenAmount && item.rewardTokenAmount?.toNumber() > 0).length.toLocaleString("en-US");
    const numAnswered = results.length.toLocaleString("en-US");

    return new ImageResponse(
        (
            <div tw="h-full w-full flex flex-col bg-[#F3F2EC] p-[19px]">
                <div tw="flex flex-row">
                    I just won {bonkClaimed} $BONK from playing Chomp
                </div>
                <div tw="flex flex-row">
                    <div tw="flex">{numAnswered} questions answered</div>
                    <div tw="flex">{numCorrect} correct answers</div>
                </div>
                <div tw="flex flex-row">
                    Stop FOMOing and join the party. Flex your intelligence and win $BONK at app.chomp.games
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
      );
}