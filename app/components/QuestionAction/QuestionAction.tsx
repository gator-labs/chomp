import { QuestionType } from "@prisma/client";
import { Button } from "../Button/Button";

type QuestionOption = {
  id: number;
  option: string;
};

type QuestionActionProps = {
  type: QuestionType;
  questionOptions: QuestionOption[];
  onAnswer: (option: QuestionOption) => void;
};

export function QuestionAction({ type, questionOptions }: QuestionActionProps) {
  if (type === "TrueFalse") {
    return (
      <div>
        <span>What do you think about this statement?</span>
        <div>
          {questionOptions.map((qo) => (
            <Button variant="primary" key={qo.id}>
              {qo.option}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return <div></div>;
}
