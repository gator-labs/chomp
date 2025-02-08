import { Avatar } from "@/app/components/Avatar/Avatar";
import Image from "next/image";
import { useState } from "react";

import { InfoIcon } from "../Icons/InfoIcon";
import InfoDrawer from "../InfoDrawer/InfoDrawer";
import QuestionCardLayout from "../QuestionCardLayout/QuestionCardLayout";

type PreviewDeckCardProps = {
  className?: string;
  heading: string;
  description?: string | null;
  footer?: string | null;
  imageUrl?: string | null;
  author?: string | null;
  authorImageUrl?: string | null;
  totalNumberOfQuestions: number;
  stackImage: string;
  blurData: string | undefined;
  deckCreditCost: number | null;
  totalCredits: number;
};

const CREDIT_COST_FEATURE_FLAG =
  process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

const PreviewDeckCard = ({
  className,
  heading,
  description,
  footer,
  author,
  authorImageUrl,
  stackImage,
  imageUrl,
  totalNumberOfQuestions,
  blurData,
  totalCredits,
  deckCreditCost,
}: PreviewDeckCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasEnoughCredits = deckCreditCost
    ? totalCredits >= deckCreditCost
    : false;
  const creditsRequired = deckCreditCost ? deckCreditCost - totalCredits : 0;
  const creditsPerQuestion = deckCreditCost
    ? deckCreditCost / totalNumberOfQuestions
    : 0;

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <QuestionCardLayout className={className}>
      <div className="flex flex-col gap-5">
        <h1 className="text-purple-200 font-medium text-[24px]">{heading}</h1>
        {!!description && <p className="text-[14px]">{description}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          {(imageUrl || stackImage) && (
            <div className="relative w-[77px] h-[77px]">
              <Image
                src={imageUrl || stackImage}
                blurDataURL={blurData}
                alt=""
                fill
                placeholder="blur"
                className="rounded-full overflow-hidden"
                sizes="(max-width: 600px) 50px, (min-width: 601px) 77px"
                style={{ objectFit: "cover" }}
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!!footer && <p className="text-[14px]">{footer}</p>}
            <p className="text-[14px]">
              Total {totalNumberOfQuestions} card
              {totalNumberOfQuestions > 1 && "s"}
            </p>
            {CREDIT_COST_FEATURE_FLAG && deckCreditCost !== null ? (
              <button
                className="flex items-center rounded-[56px] bg-chomp-blue-light text-xs text-gray-900 font-medium px-2 py-0.5 w-fit z-50"
                onClick={() => setIsOpen(true)}
              >
                <span className="opacity-50 pr-1">Entry </span>
                {`${deckCreditCost} Credit${deckCreditCost !== 1 ? "s" : ""}`}
                <InfoIcon fill="#0d0d0d" />
              </button>
            ) : null}
            <div className="flex gap-2 items-center">
              {!!authorImageUrl && (
                <div className="">
                  <Avatar
                    size="small"
                    className="border-purple-200"
                    src={authorImageUrl}
                  />
                </div>
              )}
              {!!author && (
                <p className="text-[12px] font-bold leading-[16.5px]">
                  By {author}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <InfoDrawer isOpen={isOpen} onClose={onClose} title="What are credits?">
        {deckCreditCost !== 0 ? (
          <div className="text-sm mb-6 space-y-4">
            <p>
              {hasEnoughCredits ? deckCreditCost : creditsRequired} Credit
              {hasEnoughCredits
                ? deckCreditCost !== 1
                  ? "s"
                  : ""
                : creditsRequired !== 1
                  ? "s"
                  : ""}{" "}
              {hasEnoughCredits
                ? deckCreditCost === 1
                  ? "is"
                  : "are"
                : creditsRequired === 1
                  ? "is"
                  : "are"}{" "}
              required to answer this deck.
            </p>
            <p>
              Each question in this deck costs {creditsPerQuestion} Credit
              {creditsPerQuestion !== 1 ? "s" : ""} to answer. Since there{" "}
              {totalNumberOfQuestions > 1 ? "are" : "is"}{" "}
              {totalNumberOfQuestions} question
              {totalNumberOfQuestions !== 1 ? "s" : ""} in this deck, answering{" "}
              {totalNumberOfQuestions} question
              {totalNumberOfQuestions !== 1 ? "s" : ""} in this deck, answering
              the entire deck costs {deckCreditCost} Credit
              {deckCreditCost !== 1 ? "s" : ""}. You are only charged for
              questions you see.
            </p>
            <p>
              <b className="text-chomp-blue-light">Validate decks</b> allow you
              to earn BONK rewards. You&apos;ll get your Credits back for giving
              the best answer for the first order question, and up to an
              additional BONK per question depending on the accuracy of your
              second order response.
            </p>
            <p>
              To learn more about rewards, read our documentation{" "}
              <a
                href="https://docs.chomp.games/how-to-earn"
                target="_blank"
                className="text-secondary underline"
              >
                here
              </a>
            </p>
          </div>
        ) : (
          <div className="text-sm mb-6 space-y-4">
            <p>You can answer this deck without using Credits!</p>
            <p>
              <b className="text-[#D0CBB4]">Practice decks</b> allow you to earn
              streaks or points without earning BONK.
            </p>
            <p>
              To learn more about rewards, read our documentation{" "}
              <a
                href="https://docs.chomp.games/how-to-earn"
                target="_blank"
                className="text-secondary underline"
              >
                here
              </a>
            </p>
          </div>
        )}
      </InfoDrawer>
    </QuestionCardLayout>
  );
};

export default PreviewDeckCard;
