"use client";

import { getRevealedAtString } from "@/app/utils/dateUtils";
import { Checkbox } from "../Checkbox/Checkbox";
import { ClockIcon } from "../Icons/ClockIcon";

type RevealQuestionCardProps = {
  question: string;
  date: Date;
  isSelected: boolean;
  handleSelect: () => void;
};

export default function RevealQuestionCard({
  question,
  date,
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
        <p>{question}</p>
      </span>
      <div className="flex items-center justify-between">
        <span className="flex gap-1 items-center">
          <ClockIcon width={18} height={18} /> {getRevealedAtString(date)}
        </span>
        <p className="text-emerald-400">Chomped</p>
      </div>
    </div>
  );
}
