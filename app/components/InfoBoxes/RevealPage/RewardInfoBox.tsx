"use client";
import { useState } from "react";
import { InfoIcon } from "../../Icons/InfoIcon";
import Sheet from "../../Sheet/Sheet";

const RewardInfoBox = () => {
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  return (
    <div
      onClick={() => {
        setIsInfoSheetOpen(true);
      }}
      className="cursor-pointer"
    >
      <InfoIcon height={24} width={24} fill="#fff" />
      <Sheet
        isOpen={isInfoSheetOpen}
        setIsOpen={setIsInfoSheetOpen}
        closeIconHeight={16}
        closeIconWidth={16}
      >
        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-5">
            <h3 className="text-pink text-base font-bold  text-left">
              Your Rewards Explained
            </h3>
            <div className="text-sm font-light  text-left flex flex-col gap-4">
              <p>
                You have just burned <span className="font-bold">5K $BONK</span>{" "}
                to reveal the answer to a question.
              </p>
              <p>
                This gets you access to the{" "}
                <span className="font-bold">best answer of the question</span>,
                and also makes you eligible for potential rewards for having
                chosen the right answers.
              </p>
              <p>
                When your{" "}
                <span className="font-bold text-purple-500">
                  1st-order-answer
                </span>{" "}
                is the same as the best answer to the question (as calculated
                using Chomp&apos;s mechanism), you will be rewarded with{" "}
                <span className="font-bold text-aqua">5K $BONK</span>, meaning
                you have netted out to chomping this card for free.
              </p>
              <p>
                Then, depending on the distance between your{" "}
                <span className="font-bold text-purple-500">
                  2nd-order-answer
                </span>{" "}
                and the actual revealed percentage of how everyone selected
                their 1st-order-answer, your reward will vary and be between{" "}
                <span className="font-bold text-aqua">0-5k $BONK.</span>
              </p>
              <p>
                Roughly 40% of the chompers that gave a correct 1st-order-answer
                will be given an additional reward for the 2nd-order-answer. The
                total maximum reward of one question is{" "}
                <span className="font-bold text-aqua">10k $BONK.</span>
              </p>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
};

export default RewardInfoBox;
