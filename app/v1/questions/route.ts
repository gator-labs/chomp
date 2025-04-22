import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  console.error("create-question")
  console.error(request)
  console.error(request.headers)

  // const body = await request.json();
  // console.log("got body", body);
  return Response.json({
    message: "Hello, world!",
  });
}