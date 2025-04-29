import { questionSchema } from "@/app/schemas/v1/question";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();

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
