import { ChompyGuitarIcon } from "@/app/components/Icons/ChompyGuitarIcon";
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
          <div tw="flex-1 p-6 rounded-[12px] bg-[#D6FCF4] flex justify-center items-center mr-4">
            <div tw="flex">
              <p tw="text-[120px] leading-[40px] text-[#0C5546] font-black mr-6">
                {numAnswered}
              </p>
            </div>
            <div tw="flex flex-col">
              <span tw="text-[40px] text-[#68C6B2] font-black flex">
                questions
              </span>
              <span tw="text-[40px] text-[#68C6B2] font-black flex">
                answered
              </span>
            </div>
          </div>
          <div tw="flex-1 p-6 rounded-[12px] bg-[#FBF3BA] flex justify-center items-center mr-4">
            <div tw="flex">
              <p tw="text-[120px] leading-[40px] text-[#6C6219] font-black mr-6">
                {numCorrect}
              </p>
            </div>
            <div tw="flex flex-col">
              <span tw="text-[40px] text-[#CCBF64] font-black flex">
                correct
              </span>
              <span tw="text-[40px] text-[#CCBF64] font-black flex">
                answers
              </span>
            </div>
          </div>
        </div>

        <div tw="flex flex-row">
          <div tw="text-[40px] p-4 font-bold text-purple-200 bg-[#5955D6] rounded-[12px] flex flex-col w-4/5">
            <p tw="my-0">Stop FOMOing and join the party.</p>
            <p tw="my-0">Flex your intelligence and win</p>
            <p tw="my-0">
              $BONK at
              <span tw="text-[#FFFFFF] ml-3">app.chomp.games</span>
            </p>
          </div>
          <div tw="flex w-[10px]"></div>
          <div tw="flex flex-col grow">
            <ChompyGuitarIcon width={220} height={200} />
          </div>
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
