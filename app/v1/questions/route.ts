import { questionSchema } from "@/app/schemas/v1/question";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.error("got request", request);
  const data = await request.json();
  console.error("got data", data);
  // parse backend-secret and source headers
  const backendSecret = request.headers.get("backend-secret");
  if (backendSecret !== process.env.BACKEND_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // source corresponds to Zuplo -> Services -> API Key Service -> select consumer -> metadata -> source
  // containts values like 'melee' or 'marvin'
  const source = request.headers.get("source");
  console.error("got source", source);
  
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
