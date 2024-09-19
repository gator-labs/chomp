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

    console.log("results", results)
    const bonkClaimedRaw = results.reduce((sum, item) => sum + (item.rewardTokenAmount?.toNumber() || 0), 0);
    const bonkClaimed = Math.round(bonkClaimedRaw).toLocaleString("en-US")
    const numCorrect = results.filter(item => item.rewardTokenAmount && item.rewardTokenAmount?.toNumber() > 0).length.toLocaleString("en-US");
    const numAnswered = results.length.toLocaleString("en-US");

    console.log('bonkClaimed:', bonkClaimed);
    console.log('numCorrect:', numCorrect);
    console.log('numAnswered:', numAnswered);

    return new ImageResponse(
        (
          <div
            tw="h-full w-full flex bg-[#F3F2EC] p-[19px]"
          >
            <div tw="text-2xl flex flex-col text-black">
              <p>Burn tx: {burnTx}</p>
              <p>Won: {bonkClaimed} $BONK</p>
              <p>Correct: {numCorrect}</p>
              <p>Answered: {numAnswered}</p>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        },
      );
}