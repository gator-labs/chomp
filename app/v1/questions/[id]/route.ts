import {
  UpdateQuestionParams,
  UpdateQuestionParamsSchema,
  UpdateQuestionSchema,
} from "@/app/schemas/v1/update";
import {
  ApiAnswerInvalidError,
  ApiError,
  ApiQuestionInvalidError,
} from "@/lib/error";
import { updateQuestion } from "@/lib/v1/updateQuestion";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, params: UpdateQuestionParams) {
  const backendSecret = request.headers.get("backend-secret");

  if (!backendSecret || backendSecret !== process.env.BACKEND_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = request.headers.get("source");

  if (!source) {
    return Response.json(
      { error: "missing_source", message: "Missing source field" },
      { status: 400 },
    );
  }

  try {
    const data = await request.json();
    const req = UpdateQuestionSchema.safeParse(data);

    const urlParams = UpdateQuestionParamsSchema.safeParse(params);

    if (!urlParams.success) {
      throw new ApiAnswerInvalidError("Invalid question ID");
    }

    if (!req.success) {
      const issues = req.error.issues;
      for (const issue of issues) {
        throw new ApiAnswerInvalidError(
          `${issue.path[0]} is missing or invalid`,
        );
      }
      throw new ApiQuestionInvalidError("data invalid");
    }

    const questionId = urlParams.data.params.id;

    await updateQuestion(questionId, source, req.data);

    return NextResponse.json({
      success: true,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json(
        { error: e.error, message: e.message },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }
}
