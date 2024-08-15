import { useToast } from "@/app/providers/ToastProvider";
import { copyTextToClipboard } from "@/app/utils/clipboard";
import { getBonkBalance } from "@/app/utils/solana";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Question } from "../Bot/Bot";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../Dialog/Dialog";
import { CopyIcon } from "../Icons/CopyIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import RevealQuestionCard from "../RevealQuestionCard/RevealQuestionCard";
import SkeletonCard from "../SkeletonCard/SkeletonCard";

type RevealQuestionsFeedProps = {
  selectAll: boolean;
  handleSelectAll: () => void;
  questions: Question[];
  selectedRevealQuestions: number[];
  handleSelect: (id: number) => void;
  onBurn: () => void;
  wallet: string;
  isQuestionsLoading: boolean;
};
export default function RevealQuestionsFeed({
  selectAll,
  handleSelectAll,
  questions,
  selectedRevealQuestions,
  handleSelect,
  onBurn,
  wallet,
  isQuestionsLoading,
}: RevealQuestionsFeedProps) {
  const [bonkBalance, setBonkBalance] = useState(0);
  const { successToast } = useToast();

  const totalRevealTokenAmount = selectedRevealQuestions.reduce((acc, id) => {
    const question = questions.find((q) => q.id === id);
    if (question) {
      return acc + question.revealTokenAmount;
    }
    return acc;
  }, 0);

  useEffect(() => {
    const fetchBonkBalance = async () => {
      const balance = await getBonkBalance(wallet);
      setBonkBalance(balance);
    };

    fetchBonkBalance();
  }, [wallet]);

  return (
    <>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="select-all"
          checked={selectAll}
          onClick={handleSelectAll}
        />
        <label
          htmlFor="select-all"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Select All
        </label>
      </div>
      <div className="flex flex-col w-full h-[17rem] gap-2 overflow-auto">
        {isQuestionsLoading ? (
          // Show SkeletonCard components while loading
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : questions.length > 0 ? (
          // Show questions if available
          questions.map((questionData: Question, index) => (
            <RevealQuestionCard
              key={index}
              question={questionData.question}
              date={questionData.revealAtDate}
              isSelected={selectedRevealQuestions.includes(questionData.id)}
              handleSelect={() => handleSelect(questionData.id)}
            />
          ))
        ) : (
          // Show message if no questions are available
          <p>No questions for reveal. Keep Chomping!</p>
        )}
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="purple"
            size="normal"
            className="gap-2 text-black font-medium mt-4"
            isFullWidth
            disabled={selectedRevealQuestions.length <= 0}
          >
            {selectedRevealQuestions.length > 1
              ? "Reveal Cards"
              : "Reveal Card"}
          </Button>
        </DialogTrigger>
        {bonkBalance >= totalRevealTokenAmount ? (
          <DialogContent className="top-[70%] border-0 max-w-full rounded-t-3xl">
            <DialogHeader>
              <DialogTitle className="text-left font-medium text-lg text-purple">
                Reveal {selectedRevealQuestions.length}{" "}
                {selectedRevealQuestions.length > 1 ? "cards?" : "card?"}
              </DialogTitle>
              <DialogDescription className="text-left">
                This will cost you <b>{totalRevealTokenAmount} BONK.</b>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 w-full">
              <Button
                variant="white"
                size="normal"
                className="rounded-3xl"
                isFullWidth
                onClick={onBurn}
              >
                Reveal
              </Button>
              <DialogPrimitive.Close>
                <Button
                  variant="black"
                  size="normal"
                  className="rounded-3xl"
                  isFullWidth
                >
                  Cancel
                </Button>
              </DialogPrimitive.Close>
              <div className="flex w-full gap-2 p-4 text-sm items-start justify-start bg-neutral-600 rounded-lg">
                <InfoIcon width={40} height={20} />{" "}
                <p>
                  You would need to burn $BONK to reveal the answer, regardless
                  of whether you&apos;ve chomped on the question card earlier or
                  not.
                  <br />
                  <br />
                  Rewards will be claimed automatically in this transaction, and
                  you will see a summary of the transaction on the next screen.
                </p>
              </div>
            </div>
          </DialogContent>
        ) : (
          <DialogContent className="bottom-[-20%] border-0 max-w-full rounded-t-3xl">
            <DialogHeader>
              <DialogTitle className="text-left font-medium text-lg text-[#DD7944]">
                Insufficient Funds
              </DialogTitle>
              <DialogDescription className="text-left">
                It looks like you have insufficient funds to go to the next
                step. Please visit this link to learn how to fund your wallet.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 w-full mb-4">
              <a
                href="https://x.com/chompdotgames/status/1798664081102258304"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className={`flex flex-row justify-center w-full py-2 px-5 rounded-3xl bg-white text-[#0D0D0D]`}
                >
                  Learn More
                </button>
              </a>

              <button
                onClick={() => {
                  copyTextToClipboard(wallet);
                  successToast("Address copied successfully!");
                }}
                className={`flex flex-row justify-center w-full py-2 px-5 rounded-3xl bg-purple text-[#0D0D0D]`}
              >
                Copy Wallet Address
                <CopyIcon fill="#0D0D0D" />
              </button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
