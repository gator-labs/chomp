import { ImageResponse } from 'next/og';

 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || "hello world"

  return new ImageResponse(
    (
      <div
        style={{
          overflowY: "hidden",
          overflowX: "hidden",
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${process.env.VERCEL_URL}/images/share-template.png)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          backgroundPosition: "center center"
        }}
      >
        <div tw="text-2xl flex flex-col text-white">
          <p>Username: {username}</p>
          <p>If a project made me gradually earn an airdrop through continuous contributions, I would be:</p>
          <p>My answer: annoyed</p>
          <p>I think 77% of others also selected annoyed</p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}