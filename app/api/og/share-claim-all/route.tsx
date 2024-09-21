import prisma from "@/app/services/prisma";
import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const burnTx = searchParams.get("burnTx");

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

  const results = burnTx
    ? await prisma.chompResult.findMany({
        where: {
          burnTransactionSignature: {
            contains: burnTx,
          },
        },
      })
    : [];

  const bonkClaimedRaw = results.reduce(
    (sum, item) => sum + (item.rewardTokenAmount?.toNumber() || 0),
    0,
  );
  const bonkClaimed = Math.round(bonkClaimedRaw).toLocaleString("en-US");
  const numCorrect = results
    .filter(
      (item) =>
        item.rewardTokenAmount && item.rewardTokenAmount?.toNumber() > 0,
    )
    .length.toLocaleString("en-US");

  const numAnswered = results.length.toLocaleString("en-US");

  const satoshiBlack = await fetch(
    new URL(`${APP_URL}/fonts/satoshi/Satoshi-Black.otf`, import.meta.url),
  ).then((res) => res.arrayBuffer());

  const satoshiBold = await fetch(
    new URL(`${APP_URL}/fonts/satoshi/Satoshi-Bold.otf`, import.meta.url),
  ).then((res) => res.arrayBuffer());

  const satoshiRegular = await fetch(
    new URL(`${APP_URL}/fonts/satoshi/Satoshi-Regular.otf`, import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col bg-[#F3F2EC] rounded-[12px] p-10">
        <div tw="p-5 bg-[#5955D6] rounded-[12px] flex flex-row gap-4 items-center">
          <img
            width="100"
            height="100"
            src={`${APP_URL}/avatars/1.png`}
            style={{
              borderRadius: 128,
            }}
            tw="mr-6 border-4 border-[#AFADEB]"
          />
          <div tw="flex flex-col">
            <p tw="text-[40px] leading-5 font-bold text-purple-200">
              I just won
            </p>
            <p tw="text-[40px] leading-5 font-bold text-purple-200">
              <span tw="text-white">{bonkClaimed} $BONK</span>
              <span tw="ml-4">from playing Chomp</span>
            </p>
          </div>
        </div>
        <div tw="p-4 bg-[#AFADEB] rounded-[12px] flex flex-row my-4">
          <div tw="flex-1 p-6 rounded-[12px] bg-[#D6FCF4] flex justify-center items-center gap-2 text-center mr-4">
            <p tw="text-[120px] leading-[40px] text-[#0C5546] font-black mr-4">
              {numAnswered}
            </p>
            <p tw="text-[40px] text-[#68C6B2] font-black">questions answered</p>
          </div>
          <div tw="flex-1 p-5 rounded-[12px] bg-[#FBF3BA] flex justify-center items-center gap-2 text-center">
            <p tw="text-[120px] leading-[40px] text-[#6C6219] font-black">
              {numCorrect}
            </p>
            <p tw="text-[40px] text-[#CCBF64] font-black mr-4">
              correct answers
            </p>
          </div>
        </div>

        <div tw="flex  flex-row items-center ">
          <p tw="text-[40px] p-4 font-bold text-purple-200 bg-[#5955D6] rounded-[12px] flex flex-col">
            Stop FOMOing and join the party. Flex your intelligence and win
            $BONK at <span className="text-white">app.chomp.games</span>
          </p>
          <img
            src={`${APP_URL}/images/gator-guitar.png`}
            tw="w-[20%] h-[70%]"
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { data: satoshiBlack, name: "Satoshi-Black", style: "normal" },
        { data: satoshiRegular, name: "Satoshi-Regular", style: "normal" },
        { data: satoshiBold, name: "Satoshi-Bold", style: "normal" },
      ],
    },
  );
}
