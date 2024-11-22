/* eslint-disable @next/next/no-img-element */
import { OPTION_LABEL } from "@/app/components/AnswerResult/constants";
import prisma from "@/app/services/prisma";
import { cn } from "@/lib/utils";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:image/png;base64,${btoa(binary)}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const txHashAndQId = searchParams.get("txHashAndQId");

  if (!txHashAndQId) return;

  const [txHash, questionId] = txHashAndQId.split("&");

  if (!txHash || !questionId) return;

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

  const result = txHash
    ? await prisma.chompResult.findFirst({
        where: {
          burnTransactionSignature: {
            startsWith: txHash,
          },
          questionId: Number(questionId),
        },
        include: {
          question: {
            include: {
              questionOptions: {
                include: {
                  questionAnswers: true,
                },
              },
            },
          },
          user: true,
        },
      })
    : null;

  if (!result) return;

  const bonkClaimed = Math.round(
    result.rewardTokenAmount?.toNumber() ?? 0,
  ).toLocaleString("en-US");

  console.log({ bonkClaimed, rew: result.rewardTokenAmount?.toNumber() });

  const satoshiBlack = await fetch(
    new URL(`${APP_URL}/fonts/satoshi/Satoshi-Black.otf`, import.meta.url),
  ).then((res) => res.arrayBuffer());

  const satoshiBold = await fetch(
    new URL(`${APP_URL}/fonts/satoshi/Satoshi-Bold.otf`, import.meta.url),
  ).then((res) => res.arrayBuffer());

  const satoshiRegular = await fetch(
    new URL(`${APP_URL}/fonts/satoshi/Satoshi-Regular.otf`, import.meta.url),
  ).then((res) => res.arrayBuffer());

  const satoshiMedium = await fetch(
    new URL(`${APP_URL}/fonts/satoshi/Satoshi-Medium.otf`, import.meta.url),
  ).then((res) => res.arrayBuffer());

  const qrCodeData = await readFile(
    join(process.cwd(), "/public/images/qr-code.png"),
  );
  const qrCodeUrl = Uint8Array.from(qrCodeData).buffer;

  const gatorHeadData = await readFile(
    join(process.cwd(), "/public/images/gator-head.png"),
  );
  const gatorHeadUrl = Uint8Array.from(gatorHeadData).buffer;

  const question = result.question!.question;
  const options = result.question!.questionOptions;
  const selectedAnswer = result.question?.questionOptions
    .flatMap((qo) =>
      qo.questionAnswers.filter((qa) => qa.userId === result.user.id),
    )
    .find((qa) => qa.selected);

  return new ImageResponse(
    (
      <div tw="h-full w-full flex bg-[#F3F2EC] rounded-[13.4px] p-[19px] pb-[24px]">
        <div tw="flex w-[340px] flex-col">
          <div tw="p-[8.56px] h-[66px] bg-[#5955D6] rounded-[8px] flex flex-row items-center w-full mb-[13px]">
            <img
              width="42"
              height="42"
              src={`${APP_URL}/avatars/1.png`}
              alt="profile"
              style={{
                borderRadius: 128,
              }}
              tw="mr-[10px] border-[2px] border-[#AFADEB]"
            />
            <div tw="flex flex-col">
              <p tw="text-[14px] leading-[19px] font-bold text-purple-200 p-0 m-0">
                I just won
              </p>
              <p tw="text-[21px] leading-[28px] font-bold text-purple-200 p-0 m-0">
                <span tw="text-white p-0 m-0">{bonkClaimed} $BONK</span>
                <span tw="ml-1 p-0">Chomp</span>
              </p>
            </div>
          </div>

          <div tw="w-full h-[213px] bg-[#D7D6F5] rounded-[9px] p-[11px] mb-[13px] flex flex-col">
            <div
              tw="h-[138px] w-full bg-[#333333] rounded-[5px] flex p-4 pt-[24px] relative mb-[5px] flex-col"
              style={{
                height: options.length === 2 ? "138px" : "100%",
                paddingTop: options.length === 2 ? "24px" : "10px",
              }}
            >
              <p
                tw="p-0 m-0 text-white text-[20px] leading-[23px]"
                style={{
                  fontSize: options.length === 2 ? "20px" : "14px",
                  lineHeight: options.length === 2 ? "23px" : "15px",
                  fontFamily: '"Satoshi-Medium"',
                }}
              >
                {question}
              </p>

              {options.length === 4 && (
                <ul tw="flex flex-col flex-1 justify-between mt-[10px]">
                  {options.map((option, index) => (
                    <li
                      key={option.id}
                      tw="flex text-[4.6px] leading-[6.22px] gap-2"
                    >
                      <div
                        style={{
                          fontFamily: '"Satoshi-Medium"',
                        }}
                        tw={cn(
                          "w-5 bg-[#4D4D4D] w-10 h-[23px] text-white flex justify-center items-center rounded-[4px] text-[8px] leading-[10px] mr-[14px]",
                          {
                            "bg-[#5955D6]": index === 1,
                          },
                        )}
                      >
                        {OPTION_LABEL[index as keyof typeof OPTION_LABEL]}
                      </div>
                      <div
                        tw="border-[1px] border-[#666666] bg-[#333333] rounded-[4px] flex-1 items-center flex pl-[16px] text-white text-[8px] leading-[10px] h-[23px]"
                        style={{
                          fontFamily: '"Satoshi-Medium"',
                        }}
                      >
                        <p>{option.option}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <img
                src={arrayBufferToBase64(gatorHeadUrl)}
                alt="gator"
                tw="absolute bottom-0 left-0"
                width={205}
                height={78}
              />

              {options.length === 2 && !!result.question?.imageUrl && (
                <img
                  src={result.question.imageUrl}
                  alt="gator"
                  tw="ml-auto mt-auto object-cover"
                  width={32}
                  height={32}
                />
              )}
            </div>
            {options.length === 2 && (
              <div tw="flex flex-col">
                <p tw="text-[8px] leading-[10px] text-[#0D0D0D] p-0 m-0 text-center justify-center mb-[5px]">
                  Do you agree with this statement?
                </p>

                <div tw="flex">
                  {options.map((option, i) => (
                    <div
                      tw="h-[28px] flex-1 flex justify-center items-center text-[8px] leading-[10px] rounded-[5px]"
                      style={{
                        marginRight: i === 0 ? 5 : 0,
                        background:
                          selectedAnswer?.questionOptionId === option.id
                            ? "#5F5BD7"
                            : "#A3A3EC",
                        color:
                          selectedAnswer?.questionOptionId === option.id
                            ? "#fff"
                            : "#0D0D0D",
                      }}
                      key={option.id}
                    >
                      {option.option}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div tw="p-[8.56px] h-[75px] bg-[#5955D6] rounded-[8px] flex flex-row items-center w-full">
            <p
              tw="text-[21px] leading-[28px] font-bold text-purple-200 p-0 m-0 flex flex-col"
              style={{
                fontFamily: '"Satoshi-Bold"',
              }}
            >
              Join the party and win BONK at
              <span
                tw="text-white"
                style={{
                  fontFamily: '"Satoshi-Black"',
                }}
              >
                app.chomp.games
              </span>
            </p>
          </div>
        </div>

        <div tw="flex flex-col ml-[16px]">
          <div
            tw="flex flex-col"
            style={{
              fontFamily: '"Satoshi-Medium"',
            }}
          >
            <span tw="m-0 p-0 mb-[7px] text-[27px] leading-[30px] tracking-tight">
              Know the answer?
            </span>
            <span tw="m-0 p-0 mb-[7px] text-[27px] leading-[30px] tracking-tight">
              Prove it, and win.{" "}
            </span>
          </div>
          <div tw="flex flex-col">
            <span tw="m-0 p-0 mb-[7px] text-[27px] leading-[30px] tracking-tight">
              Keep proving it,
            </span>
            <span tw="m-0 p-0 mb-[7px] text-[27px] leading-[30px] tracking-tight">
              and win forever 😉
            </span>
          </div>
          <img
            src={arrayBufferToBase64(qrCodeUrl)}
            tw="w-full h-[227px] border-[2.73px] border-[#5955D6] rounded-[16px]"
            alt="qr-code"
          />
        </div>
      </div>
    ),
    {
      width: 622,
      height: 418,
      fonts: [
        { data: satoshiBlack, name: "Satoshi-Black", style: "normal" },
        { data: satoshiMedium, name: "Satoshi-Medium", style: "normal" },
        { data: satoshiRegular, name: "Satoshi-Regular", style: "normal" },
        { data: satoshiBold, name: "Satoshi-Bold", style: "normal" },
      ],
    },
  );
}
