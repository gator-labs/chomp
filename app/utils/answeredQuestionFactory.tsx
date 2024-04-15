"use client";
import { Question } from "@prisma/client";
import { MultipleChoiceAnsweredContent } from "../components/MultipleChoiceAnsweredContent/MultipleChoiceAnsweredContent";
import { BooleanAnsweredContent } from "../components/BooleanAnsweredContent/BooleanAnsweredContent";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { Modal } from "../components/Modal/Modal";
import { ImageIcon } from "../components/Icons/ImageIcon";
import { useCallback, useMemo, useState } from "react";
import {
  isBinaryQuestionCorrectAnswer,
  mapQuestionToBinaryQuestionAnswer,
} from "./question";
import { DeckQuestionIncludes } from "../components/DeckDetails/DeckDetails";
import { AnswerResultIcon } from "../components/Icons/AnswerResultIcon";
import { PercentageIcon } from "../components/Icons/PercentageIcon";
import { InfoIcon } from "../components/Icons/InfoIcon";

export const AnsweredQuestionContentFactory = (
  element: DeckQuestionIncludes,
) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isFirstOrderQuestionCorrect, setIsFirstOrderQuestionCorrect] =
    useState(false);
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

  const handleBinary = useCallback(() => {
    const binaryQuestionResults = mapQuestionToBinaryQuestionAnswer(element);
    if (binaryQuestionResults) {
      setIsFirstOrderQuestionCorrect(
        isBinaryQuestionCorrectAnswer(
          binaryQuestionResults[0],
          binaryQuestionResults[1],
        ),
      );

      const selected = binaryQuestionResults.find((q) => q.selected);
      if (selected) {
        setIsSecondOrderQuestionCorrect(
          selected.calculatedPercentage === selected.selectedPercentage,
        );
      }
    } else {
      setIsFirstOrderQuestionCorrect(false);
      setIsSecondOrderQuestionCorrect(false);
    }
  }, [
    setIsFirstOrderQuestionCorrect,
    setIsSecondOrderQuestionCorrect,
    element,
  ]);

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
        return <BooleanAnsweredContent {...baseProps} />;
      }
    }

    return <></>;
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
        </p>
        <p>
          We are also in the process of implementing additional points and/or
          token rewards through multi-day streaks and sweepstakes
        </p>
      </Modal>
    </div>
  );
};
