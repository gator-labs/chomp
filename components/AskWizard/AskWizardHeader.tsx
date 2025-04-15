import { ChevronRightIcon } from "@/app/components/Icons/ChevronRightIcon";
import { InfoIcon } from "@/app/components/Icons/InfoIcon";
import { QuestionType } from "@prisma/client";
import React from "react";

enum Page {
  QuestionType,
  QuestionForm,
  Confirmation,
}

export type AskWizardHeaderProps = {
  questionType: QuestionType;
  onSetPage: (page: Page) => void;
};

export function AskWizardHeader({
  questionType,
  onSetPage,
}: AskWizardHeaderProps) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div
            className="bg-purple-500 px-4 py-2 font-bold rounded-sm cursor-pointer"
            onClick={() => onSetPage(Page.QuestionType)}
          >
            Ask
          </div>
          <div className="px-2">
            <ChevronRightIcon width={32} height={32} />
          </div>
          <div>
            Question with{" "}
            {questionType == QuestionType.BinaryQuestion ? "2" : "4"} choices.
          </div>
        </div>
        <InfoIcon />
      </div>
      <hr className="border-gray-600 my-2 p-0" />
    </div>
  );
}
