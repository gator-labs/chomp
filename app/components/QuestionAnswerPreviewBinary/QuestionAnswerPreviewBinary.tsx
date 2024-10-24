"use client";

import Pill from "../Pill/Pill";
import QuestionAnswerPreview from "../QuestionAnswerPreview/QuestionAnswerPreview";

type QuestionAnswerPreviewBinaryProps = {
  question: string;
  optionSelected: string;
  viewImageSrc?: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
};

export default function QuestionAnswerPreviewBinary(
  props: QuestionAnswerPreviewBinaryProps,
) {
  return (
    <QuestionAnswerPreview
      {...props}
      tagElement={
        <Pill variant="white" size="small" className="ml-2">
          {props.optionSelected}
        </Pill>
      }
    />
  );
}
