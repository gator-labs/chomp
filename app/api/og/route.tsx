import { ImageResponse } from "next/og";

export const runtime = "edge";

const INDEX = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const claimableAmount = searchParams.get("claimableAmount");
  const selectedOption = searchParams.get("selectedOption");
  const question = searchParams.get("question");
  const questionOptions = searchParams.getAll("questionOptions");
  const questionType = searchParams.get("questionType");

  console.log({ questionType, questionOptions, question }, "ODEEEE");

  const satoshiBlack = await fetch(
    new URL("@/public/fonts/satoshi/Satoshi-Black.otf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const satoshiBold = await fetch(
    new URL("@/public/fonts/satoshi/Satoshi-Bold.otf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const satoshiRegular = await fetch(
    new URL("@/public/fonts/satoshi/Satoshi-Regular.otf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const qrCodeData = (await fetch(
    new URL("@/public/images/qr-code.png", import.meta.url),
  ).then((res) => res.arrayBuffer())) as string;

  const avatarData = (await fetch(
    new URL("@/public/images/avatar_placeholder.png", import.meta.url),
  ).then((res) => res.arrayBuffer())) as string;

  const userImage = searchParams
    .get("userImage")
    ?.includes(process.env.AWS_S3_BUCKET_NAME!)
    ? searchParams.get("userImage")
    : avatarData;

  return new ImageResponse(
    (
      <div
        tw="h-full w-full flex bg-[#F3F2EC] p-[19px]"
        style={{ letterSpacing: "-0.03em" }}
      >
        <div tw="flex flex-col justify-between max-w-[340px] w-full mr-4">
          <div tw="bg-[#5955D6] p-2 rounded-lg w-full flex mb-[10px] items-center">
            <img
              src={userImage}
              width={42}
              height={42}
              style={{ borderRadius: 100, marginRight: 10 }}
            />
            <div tw="flex flex-col">
              <div
                className="text-[14px] leading-[19px] font-black"
                style={{
                  color: "#AFADEB",
                }}
              >
                I just won
              </div>
              <div tw="text-[21px] leading-[28px] font-black flex text-purple-200 flex">
                <span tw="text-white mr-1">{claimableAmount} BONK</span> from
                Chomp
              </div>
            </div>
          </div>
          {questionType === "BinaryQuestion" ? (
            <div
              style={{
                background: "#D7D6F5",
                width: "100%",
                flex: 1,
                marginBottom: "10px",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#333333",
                  padding: "24px 16px",
                  width: "100%",
                  height: 138,
                  display: "flex",
                  borderRadius: "4px",
                  marginBottom: "5px",
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontSize: "20px",
                    lineHeight: "23px",
                    fontFamily: "Satoshi-Bold",
                  }}
                >
                  {question}
                </div>
                <svg
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                  }}
                  width="206"
                  height="79"
                  viewBox="0 0 206 79"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.03"
                    d="M19.9737 19.9394H29.7057V10.1793H39.4376V0.413776H78.6303C78.6303 0.413776 78.6303 0.413776 78.6465 0.424638C78.6573 0.435501 78.6627 0.451795 78.6627 0.468089C78.6627 3.68886 78.6627 6.90964 78.6627 10.1467H98.0024V0.408344H117.672V10.163H127.387V39.5356C127.841 39.6171 155.124 39.6497 156.681 39.5736V29.8461H176.247V39.5736H185.979V29.8407H205.513V78.8801H0.455719V49.4804H10.1553V29.8244H19.9737V19.9394ZM117.569 29.9004H107.848C107.848 26.6308 107.848 23.372 107.848 20.1186C107.848 20.1023 107.837 20.086 107.832 20.0752C107.821 20.0643 107.81 20.0534 107.815 20.0589H98.1374C98.0564 22.264 98.0942 39.1228 98.1753 39.5682H117.574V29.895L117.569 29.9004ZM59.1231 20.0534V39.5682H78.5492V29.9276H68.9037C68.666 29.7864 68.7308 29.58 68.7308 29.4062C68.7308 26.457 68.7308 23.5132 68.7308 20.564V20.0589H59.1231V20.0534ZM166.548 49.4749V59.2241C168.25 59.2948 175.718 59.2676 176.139 59.1916V49.4749H166.548ZM186.103 49.4749V59.2241C187.827 59.2948 195.273 59.2676 195.695 59.1916V49.4749H186.103Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div
                style={{
                  fontSize: "8px",
                  lineHeight: "10px",
                  color: "#0D0D0D",
                  fontFamily: "Satoshi-Bold",
                  marginBottom: "5px",
                }}
              >
                Do you agree with this statement?
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "28px",
                  gap: "4px",
                }}
              >
                {questionOptions.map((qo) => {
                  return (
                    <div
                      key={qo}
                      style={{
                        display: "flex",
                        fontSize: "8px",
                        lineHeight: "10px",
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        background:
                          selectedOption === qo ? "#5955D6" : "#4D4D4D",
                        borderRadius: "5px",
                      }}
                    >
                      <div>{qo}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "#D7D6F5",
                width: "100%",
                flex: 1,
                marginBottom: "10px",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#333333",
                  padding: "24px 16px",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  borderRadius: "4px",
                  marginBottom: "5px",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontSize: "14px",
                    lineHeight: "15px",
                    fontFamily: "Satoshi-Bold",
                  }}
                >
                  {question}
                </div>
                <svg
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                  }}
                  width="206"
                  height="79"
                  viewBox="0 0 206 79"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.03"
                    d="M19.9737 19.9394H29.7057V10.1793H39.4376V0.413776H78.6303C78.6303 0.413776 78.6303 0.413776 78.6465 0.424638C78.6573 0.435501 78.6627 0.451795 78.6627 0.468089C78.6627 3.68886 78.6627 6.90964 78.6627 10.1467H98.0024V0.408344H117.672V10.163H127.387V39.5356C127.841 39.6171 155.124 39.6497 156.681 39.5736V29.8461H176.247V39.5736H185.979V29.8407H205.513V78.8801H0.455719V49.4804H10.1553V29.8244H19.9737V19.9394ZM117.569 29.9004H107.848C107.848 26.6308 107.848 23.372 107.848 20.1186C107.848 20.1023 107.837 20.086 107.832 20.0752C107.821 20.0643 107.81 20.0534 107.815 20.0589H98.1374C98.0564 22.264 98.0942 39.1228 98.1753 39.5682H117.574V29.895L117.569 29.9004ZM59.1231 20.0534V39.5682H78.5492V29.9276H68.9037C68.666 29.7864 68.7308 29.58 68.7308 29.4062C68.7308 26.457 68.7308 23.5132 68.7308 20.564V20.0589H59.1231V20.0534ZM166.548 49.4749V59.2241C168.25 59.2948 175.718 59.2676 176.139 59.1916V49.4749H166.548ZM186.103 49.4749V59.2241C187.827 59.2948 195.273 59.2676 195.695 59.1916V49.4749H186.103Z"
                    fill="white"
                  />
                </svg>
                {questionOptions.map((qo, index) => (
                  <div
                    key={qo}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        height: "23px",
                        width: "40px",
                        background:
                          selectedOption === qo ? "#5955D6" : "#4D4D4D",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "4px",
                        color: "#fff",
                        fontSize: "8px",
                        lineHeight: "10px",
                        fontFamily: "Satoshi-Bold",
                      }}
                    >
                      {INDEX[index as keyof typeof INDEX]}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        padding: "6px 16px",
                        border: "1px solid #666666",
                        height: "23px",
                        fontSize: "8px",
                        borderRadius: "4px",
                        lineHeight: "10px",
                        color: "#fff",
                      }}
                    >
                      {qo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div tw="bg-[#5955D6] p-2 rounded-lg w-full flex flex-col">
            <p
              tw="text-[21px] leading-[28px] font-black p-0 m-0 flex flex-col text-purple-100"
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              Join the party and win BONK at
              <span style={{ fontFamily: "Satoshi-Black", color: "#fff" }}>
                app.chomp.games
              </span>
            </p>
          </div>
        </div>
        <div tw="flex flex-col flex-1 h-full justify-between">
          <div
            tw="text-[27px] leading-[30px]"
            style={{ fontFamily: "Satoshi-Regular" }}
          >
            Know the answer?
          </div>
          <div
            tw="text-[27px] leading-[30px] mb-2"
            style={{ fontFamily: "Satoshi-Regular" }}
          >
            Prove it, and win.
          </div>
          <div tw="text-[27px] leading-[30px] mb-4">
            Keep proving it, and win forever😉
          </div>

          <img
            src={qrCodeData}
            width={227}
            height={227}
            className="mt-auto m-0 p-0 block"
          />
        </div>
      </div>
    ),
    {
      width: 622,
      height: 418,
      emoji: "noto",
      fonts: [
        { data: satoshiBlack, name: "Satoshi-Black", style: "normal" },
        { data: satoshiRegular, name: "Satoshi-Regular", style: "normal" },
        { data: satoshiBold, name: "Satoshi-Bold", style: "normal" },
      ],
    },
  );
}
