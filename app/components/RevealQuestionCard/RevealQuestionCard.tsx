"use client";

import { Checkbox } from "../Checkbox/Checkbox";
import { ClockIcon } from "../Icons/ClockIcon";

type RevealQuestionCardProps = {
  question: string;
  isSelected: boolean;
  handleSelect: () => void;
};

export default function RevealQuestionCard({
  question,
  isSelected,
  handleSelect,
}: RevealQuestionCardProps) {
  return (
    <div
      className="flex flex-col bg-neutral-800 border border-neutral-600 rounded-2xl p-4 gap-2"
      onClick={handleSelect}
    >
      <span className="flex gap-3 items-center">
        <Checkbox checked={isSelected} />
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio
          doloremque labore necessitatibus!
        </p>
      </span>
      <div className="flex items-center justify-between">
        <span className="flex gap-1 items-center">
          <ClockIcon /> Revealed 18hr ago
        </span>
        <p className="text-emerald-400">Chomped</p>
      </div>
    </div>
  );
}
