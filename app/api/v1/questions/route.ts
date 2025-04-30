import { questionSchema } from "@/app/schemas/v1/question";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("got request", request);
  const data = await request.json();
  console.log("got data", data);
  // parse backend-secret and source headers
  const backendSecret = request.headers.get("backend-secret");
  if (backendSecret !== process.env.BACKEND_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = request.headers.get("source");
  console.log("got source", source);
  try {
    const validation = questionSchema.safeParse(data);
    console.log(validation.error);
    return NextResponse.json({
      id: "ADD_UUID",
      options: [{ id: "ADD_GENERATED_OPTION_ID", index: 0 }],
    });
  } catch (error) {
    console.error("[Mixpanel]", error);
    return NextResponse.json({ status: "Internal Server Error" });
  }
}
