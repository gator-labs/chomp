/* eslint-disable @next/next/no-img-element */
import { ChompyGuitarIcon } from "@/app/components/Icons/ChompyGuitarIcon";
import prisma from "@/app/services/prisma";
import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startOfTxHash = searchParams.get("startOfTxHash");

  if (!startOfTxHash) return;

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

  const results = startOfTxHash
    ? await prisma.chompResult.findMany({
        where: {
          sendTransactionSignature: {
            startsWith: startOfTxHash,
          },
        },
        include: {
          user: true,
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
      <div tw="h-full w-full flex flex-col bg-[#F3F2EC] pt-[18px] px-[20px] pb-4">
        <div tw="p-[14px] bg-[#5955D6] rounded-[12px] flex flex-row items-center">
          <img
            width="72"
            height="72"
            src={
              !results[0]?.user?.profileSrc ||
              results[0].user.profileSrc.startsWith("/")
                ? `${APP_URL}${results[0].user.profileSrc}`
                : results[0]?.user?.profileSrc
            }
            alt="profile"
            style={{
              borderRadius: 128,
            }}
            tw="mr-[17px] border-4 border-[#AFADEB]"
          />
          <div tw="flex flex-col">
            <p tw="text-[24px] leading-[32px] font-bold text-purple-200 p-0 m-0">
              I just won
            </p>
            <p tw="text-[24px] leading-[32px] font-bold text-purple-200 p-0 m-0">
              <span tw="text-white">{bonkClaimed} $BONK</span>
              <span tw="ml-1">from playing Chomp</span>
            </p>
          </div>
        </div>

        <div tw="p-2 bg-[#AFADEB] rounded-[12px] flex flex-row my-[11px]">
          <div tw="flex-1 p-6 rounded-[12px] bg-[#D6FCF4] flex justify-between items-center mr-2 h-[111px] py-[25px] px-5">
            <div tw="flex">
              <p tw="text-[87px] leading-[118px] text-[#0C5546] font-black p-0">
                {numAnswered}
              </p>
            </div>
            <div tw="flex flex-col">
              <span tw="text-[30px] leading-[30px] text-[#68C6B2] font-black flex">
                questions
              </span>
              <span tw="text-[30px] leading-[30px] text-[#68C6B2] font-black flex">
                answered
              </span>
            </div>
          </div>
          <div tw="flex-1 p-6 rounded-[12px] bg-[#FBF3BA] flex justify-between items-center h-[111px] py-[25px] px-5">
            <div tw="flex">
              <p tw="text-[87px] leading-[118px] text-[#6C6219] font-black p-0">
                {numCorrect}
              </p>
            </div>
            <div tw="flex flex-col">
              <span tw="text-[30px] leading-[30px] text-[#CCBF64] font-black flex">
                correct
              </span>
              <span tw="text-[30px] leading-[30px] text-[#CCBF64] font-black flex">
                answers
              </span>
            </div>
          </div>
        </div>

        <div tw="flex flex-row justify-between">
          <div tw="text-[23.34px] leading-[31.64px] font-bold text-purple-200 bg-[#5955D6] rounded-[12px] flex flex-col  h-[134px] py-[14px] px-[20px] relative">
            <p tw="m-0 p-0">Stop FOMOing and join the party.</p>
            <p tw="m-0 p-0">Flex your intelligence and win</p>
            <p tw="m-0 p-0">
              $BONK at
              <span tw="text-[#FFFFFF] ml-1">app.chomp.games</span>
            </p>

            <div
              tw="absolute w-[10px] h-[10px] bg-[#5955D6] right-[-10px] top-[16px]"
              style={{
                clipPath: "polygon(0 0, 0% 100%, 100% 100%)",
              }}
            ></div>
          </div>
          <div tw="flex">
            <ChompyGuitarIcon width={141} height={127} />
          </div>
        </div>
      </div>
    ),
    {
      width: 622,
      height: 418,
      fonts: [
        { data: satoshiBlack, name: "Satoshi-Black", style: "normal" },
        { data: satoshiRegular, name: "Satoshi-Regular", style: "normal" },
        { data: satoshiBold, name: "Satoshi-Bold", style: "normal" },
      ],
    },
  );
}
