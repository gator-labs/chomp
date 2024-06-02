import { AnswerResult } from "../AnswerResult/AnswerResult";

type MultipleChoiceAnsweredContentProps = {
  questionOptions: {
    id: number;
    isCorrect: boolean;
    option: string;
    questionAnswers: {
      percentage: number | null;
      selected: boolean;
      percentageResult?: number | null;
    }[];
  }[];
  avatarSrc?: string;
};

export function MultipleChoiceAnsweredContent({
  questionOptions,
  avatarSrc,
}: MultipleChoiceAnsweredContentProps) {
  return (
    <div className="w-full">
      {questionOptions.map((qo, index) => (
        <div key={qo.id} className="mb-2">
          <AnswerResult
            index={index}
            percentage={qo.questionAnswers[0].percentageResult ?? 0}
            valueSelected={qo.questionAnswers[0].percentage}
            avatarSrc={avatarSrc}
            answerText={qo.option}
            progressColor={
              qo.isCorrect
                ? "#6DECAF"
                : qo.questionAnswers[0].selected
                  ? "#ED6A5A"
                  : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}
