import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { questionId: string } },
) {
  const { questionId } = params;

  return NextResponse.json({
    questionId,
    message: "Question fetched successfully",
  });
}
