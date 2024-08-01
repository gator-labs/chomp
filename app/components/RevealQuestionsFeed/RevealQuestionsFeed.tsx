import { Question } from "../Bot/Bot";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import RevealQuestionCard from "../RevealQuestionCard/RevealQuestionCard";

type RevealQuestionsFeedProps = {
  selectAll: boolean;
  handleSelectAll: () => void;
  questions: Question[];
  selectedRevealQuestions: number[];
  handleSelect: (id: number) => void;
};
export default function RevealQuestionsFeed({
  selectAll,
  handleSelectAll,
  questions,
  selectedRevealQuestions,
  handleSelect,
}: RevealQuestionsFeedProps) {
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
      <Button
        variant="purple"
        size="normal"
        className="gap-2 text-black font-medium mt-4"
        isFullWidth
      >
        {selectedRevealQuestions.length > 1 ? "Reveal Cards" : "Reveal Card"}
      </Button>
    </>
  );
}
