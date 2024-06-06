"use client";
import { AnswerResult } from "../AnswerResult/AnswerResult";
import QuestionAnswerPreview from "../QuestionAnswerPreview/QuestionAnswerPreview";

type QuestionAnswerPreviewMultipleChoiceProps = {
  options: Array<{ id: number; option: string }>;
  question: string;
  optionSelectedId: number;
  viewImageSrc?: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
};

export default function QuestionAnswerPreviewMultipleChoice(
  props: QuestionAnswerPreviewMultipleChoiceProps,
) {
  const { options, optionSelectedId } = props;
  return (
    <QuestionAnswerPreview {...props}>
      <div>
        {options?.map((qo, index) => (
          <div key={qo.id} className="mb-4">
            <AnswerResult
              index={index}
              answerText={qo.option}
              percentage={0}
              selected={qo.id === optionSelectedId}
            />
          </div>
        ))}
      </div>
    </QuestionAnswerPreview>
  );
}
