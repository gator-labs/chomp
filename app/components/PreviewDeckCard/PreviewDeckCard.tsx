import { Avatar } from "@/app/components/Avatar/Avatar";
import { DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import { useState } from "react";

import { CloseIcon } from "../Icons/CloseIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import QuestionCardLayout from "../QuestionCardLayout/QuestionCardLayout";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

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
  deckCreditCost,
}: PreviewDeckCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
                {deckCreditCost > 0
                  ? `${deckCreditCost} Credit${deckCreditCost !== 1 ? "s" : ""}`
                  : "Free"}
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
      <Drawer
        open={isOpen}
        onOpenChange={async (open: boolean) => {
          if (!open) {
            onClose();
          }
        }}
      >
        <DrawerContent className="p-6 flex flex-col">
          <DialogTitle>
            <div className="flex justify-between items-center mb-6">
              <p className="text-base text-secondary font-bold">
                What are credits?
              </p>
              <div onClick={onClose}>
                <CloseIcon width={16} height={16} />
              </div>
            </div>
          </DialogTitle>
          <p>
            Credits are required to answer this deck. <br /> <br />
            <b className="text-chomp-blue-light">Premium decks</b> allow you to
            earn BONK rewards when answers are correct. This cost is calculated
            based on the sum of the cost of each question. You will be able to
            pick up this deck if you do not finish in one sitting! <br /> <br />
            <b>Free decks</b> are available to answer and reveal for results,
            but you will not be able to earn any BONK from that deck.
          </p>
          <Button onClick={onClose} className="h-[50px] mt-6 font-bold">
            Close
          </Button>
        </DrawerContent>
      </Drawer>
    </QuestionCardLayout>
  );
};

export default PreviewDeckCard;
