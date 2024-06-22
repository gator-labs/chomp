"use client";

import { useRouter } from "next-nprogress-bar";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { saveQuestion } from "../../../actions/answer";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Answering question...");

  useEffect(() => {
    const vals = searchParams.get("vals");
    const [questionId, questionOptionId, percentageGiven] = vals!.split("~");
    const percentageGivenForAnswerId = searchParams.get(
      "percentageGivenForAnswerId",
    );

    if (!questionId) {
      return setMessage("questionId parameter is required");
    }

    if (!questionOptionId) {
      return setMessage("questionOptionId parameter is required");
    }

    if (!percentageGiven) {
      return setMessage("percentageGiven parameter is required");
    }

    saveQuestion({
      questionId: +questionId,
      questionOptionId: +questionOptionId,
      percentageGiven: +percentageGiven,
      percentageGivenForAnswerId: percentageGivenForAnswerId
        ? +percentageGivenForAnswerId
        : undefined,
    }).then(() => router.push("/application/history"));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return <div>{message}</div>;
}
