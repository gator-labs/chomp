"use client";

import AskForm from "@/app/components/AskForm/AskForm";
import { AskQuestionType } from "@/components/AskWizard/AskQuestionType";
import { QuestionType } from "@prisma/client";
import React, { useState } from "react";

import { AskQuestionSubmitted } from "./AskQuestionSubmitted";
import { AskWizardHeader } from "./AskWizardHeader";

enum Page {
  QuestionType,
  QuestionForm,
  Confirmation,
}

const POINTS_PER_QUESTION = Number(
  process.env.NEXT_PUBLIC_ASK_ACCEPTED_CREDITS_REWARD ?? 0,
);

export function AskWizard() {
  const [questionType, setQuestionType] = useState<QuestionType>(
    QuestionType.BinaryQuestion,
  );
  const [page, setPage] = useState<Page>(Page.QuestionType);

  const handleSelectQuestionType = (type: QuestionType) => {
    setQuestionType(type);
    setPage(Page.QuestionForm);
  };

  const handleSetPage = (page: Page) => {
    setPage(page);
  };

  return (
    <>
      {page === Page.QuestionType && (
        <div className="flex flex-col gap-3 h-[calc(100vh_-_12em)]">
          <AskQuestionType
            type={QuestionType.MultiChoice}
            points={POINTS_PER_QUESTION}
            onClick={() => handleSelectQuestionType(QuestionType.MultiChoice)}
          />
          <AskQuestionType
            type={QuestionType.BinaryQuestion}
            points={POINTS_PER_QUESTION}
            onClick={() =>
              handleSelectQuestionType(QuestionType.BinaryQuestion)
            }
          />
        </div>
      )}
      {page === Page.QuestionForm && (
        <div>
          <AskWizardHeader
            questionType={questionType}
            onSetPage={handleSetPage}
          />
          <AskForm questionType={questionType} onSetPage={handleSetPage} />
        </div>
      )}
      {page === Page.Confirmation && (
        <AskQuestionSubmitted points={POINTS_PER_QUESTION} />
      )}
    </>
  );
}
