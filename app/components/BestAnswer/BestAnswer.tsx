import { ReactElement } from "react";

type BestAnswerProps = {
  optionSelected?: string;
  bestOption?: string;
  children?: ReactElement;
};

export function BestAnswer({ children }: BestAnswerProps) {
  return (
    <div className="bg-gray-700 p-4 rounded">
      <div className=" text-base text-white mb-2">Your answer</div>
      {children}
    </div>
  );
}
