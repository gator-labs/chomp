"use client";
import { mapQuestionToBinaryQuestionAnswer } from "@/app/utils/question";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { useCallback, useMemo, useState } from "react";
import { BooleanAnsweredContent } from "../BooleanAnsweredContent/BooleanAnsweredContent";
import { DeckQuestionIncludes } from "../DeckDetails/DeckDetails";
import { AnswerResultIcon } from "../Icons/AnswerResultIcon";
import { ImageIcon } from "../Icons/ImageIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import { PercentageIcon } from "../Icons/PercentageIcon";
import { Modal } from "../Modal/Modal";
import { MultipleChoiceAnsweredContent } from "../MultipleChoiceAnsweredContent/MultipleChoiceAnsweredContent";

type AnsweredQuestionContentProps = {
  element: DeckQuestionIncludes;
};

export const AnsweredQuestionContent = ({
  element,
}: AnsweredQuestionContentProps) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSecondOrderQuestionCorrect, setIsSecondOrderQuestionCorrect] =
    useState(false);
  const [isViewImageOpen, setIsViewImageOpen] = useState(false);
  const baseProps = useMemo(
    () => ({
      questionOptions: (element as any).questionOptions,
      avatarSrc: AvatarPlaceholder.src,
    }),
    [element],
  );

  const isFirstOrderQuestionCorrect = element.questionOptions.some(
    (qo) => qo.isTrue && qo.questionAnswers.some((qa) => qa.selected),
  );
  const handleBinary = useCallback(() => {
    const binaryQuestionResults = mapQuestionToBinaryQuestionAnswer(element);
    if (binaryQuestionResults) {
      const selected = binaryQuestionResults.find((q) => q.selected);
      if (selected) {
        setIsSecondOrderQuestionCorrect(
          selected.calculatedPercentage === selected.selectedPercentage,
        );
      }
    } else {
      setIsSecondOrderQuestionCorrect(false);
    }
  }, [setIsSecondOrderQuestionCorrect, element]);

  const answer = useMemo(() => {
    switch (element.type) {
      case "MultiChoice": {
        return <MultipleChoiceAnsweredContent {...baseProps} />;
      }
      case "TrueFalse": {
        handleBinary();
        return <BooleanAnsweredContent {...baseProps} />;
      }
      case "YesNo": {
        handleBinary();
        return <BooleanAnsweredContent {...baseProps} isYesNo />;
      }
    }
  }, [handleBinary, baseProps, element.type]);

  return (
    <div>
      {element.imageUrl && (
        <div className="flex items-center gap-[6px] mb-1">
          <ImageIcon />
          <button
            onClick={() => setIsViewImageOpen(true)}
            className="underline text-white font-sora font-light text-sm"
          >
            View Image
          </button>
          <Modal
            isOpen={isViewImageOpen}
            onClose={() => setIsViewImageOpen(false)}
            title=""
          >
            <img src={element.imageUrl} />
          </Modal>
        </div>
      )}
      {answer}
      <div className="mt-4 flex justify-between">
        <div className="flex gap-1.5">
          <AnswerResultIcon
            fill={isFirstOrderQuestionCorrect ? "#FFFFFF" : "#4D4D4D"}
            width={30}
            height={30}
          />
          <PercentageIcon
            fill={isSecondOrderQuestionCorrect ? "#FFFFFF" : "#4D4D4D"}
            width={30}
            height={30}
          />
        </div>
        <div onClick={() => setIsInfoOpen(true)} className="cursor-pointer">
          <InfoIcon width={30} height={30} />
        </div>
      </div>

      <Modal
        title="How rewards are calculated"
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      >
        <p className="mb-3">
          Your rewards are based on both quantity and quality of your
          contribution to Chomp.
        </p>
        <p className="mb-3">
          When you perform the following actions on Chomp, you will earn a
          correlating amount of points:
        </p>
        <ul className="list-disc">
          <li className="list-item ml-5">
            A question you ask gets vetted and accepted: 69 points
          </li>
          <li className="list-item ml-5">Answer a full stack: 20 points</li>
          <li className="list-item ml-5">Answer a question: 10 points</li>
          <li className="list-item ml-5">Reveal an answer: 42 points</li>
          <li className="list-item ml-5">
            Get 1st order question exactly right: 6.9 points
          </li>
          <li className="list-item ml-5">
            Get 2nd order question exactly right: 15 points
          </li>
        </ul>
        <p>
          We are also in the process of implementing additional points and/or
          token rewards through multi-day streaks and sweepstakes
        </p>
      </Modal>
    </div>
  );
};
