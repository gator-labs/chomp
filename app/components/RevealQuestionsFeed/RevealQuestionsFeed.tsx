import * as DialogPrimitive from "@radix-ui/react-dialog";
import { RiInformationLine } from "react-icons/ri";
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
import RevealQuestionCard from "../RevealQuestionCard/RevealQuestionCard";

type RevealQuestionsFeedProps = {
  selectAll: boolean;
  handleSelectAll: () => void;
  questions: Question[];
  selectedRevealQuestions: number[];
  handleSelect: (id: number) => void;
  onBurn: () => void;


};
export default function RevealQuestionsFeed({
  selectAll,
  handleSelectAll,
  questions,
  selectedRevealQuestions,
  handleSelect,
  onBurn
}: RevealQuestionsFeedProps) {
  const totalRevealTokenAmount = selectedRevealQuestions.reduce((acc, id) => {
    const question = questions.find((q) => q.id === id);
    if (question) {
      return acc + question.revealTokenAmount;
    }
    return acc;
  }, 0);
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
        {questions.length > 0 ? (
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
          >
            {selectedRevealQuestions.length > 1
              ? "Reveal Cards"
              : "Reveal Card"}
          </Button>
        </DialogTrigger>
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
              <RiInformationLine size={45} />{" "}
              <p>
                You would need to burn $BONK to reveal the answer, regardless of
                whether you&apos;ve chomped on the question card earlier or not.
                <br />
                <br />
                Rewards will be claimed automatically in this transaction, and
                you will see a summary of the transaction on the next screen.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
