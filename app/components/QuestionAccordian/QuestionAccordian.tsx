import { ReactNode } from "react";
import { HalfArrowDownIcon } from "../Icons/HalfArrowDownIcon";
import { getRevealedAtString } from "../../utils/dateUtils";
import { HalfArrowUpIcon } from "../Icons/HalfArrowUpIcon";
import { ClockIcon } from "../Icons/ClockIcon";
import classNames from "classnames";

type StatusUnion = "chomped" | "new";
type QuestionAccordianProps = {
  question: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  status?: StatusUnion;
  reveleadAt: Date;
  children?: ReactNode;
  actionChild?: ReactNode;
};

const parseStatus = (status: StatusUnion) => {
  switch (status) {
    case "chomped":
      return "You chomped this";
    case "new":
      return "New!";
    default:
      return "";
  }
};

export function QuestionAccordian({
  question,
  isCollapsed,
  onToggleCollapse,
  reveleadAt,
  actionChild,
  children,
  status,
}: QuestionAccordianProps) {
  return (
    <div className="bg-[#333] border-[#666] rounded-2xl p-4 flex gap-2">
      <div className="w-72 flex flex-col gap-y-2">
        <div className="text-white text-base font-sora font-semibold">
          {question}
        </div>
        {!isCollapsed && children}
        {actionChild}
        <div className="flex justify-between itmes-center">
          <div className="flex items-center gap-2.5">
            <ClockIcon />
            <span className="text-sm text-white">
              {getRevealedAtString(reveleadAt)}
            </span>
          </div>
          <div
            className={classNames("text-sm leading-6", {
              "text-aqua": status === "chomped",
              "text-gray": status === "new",
            })}
          >
            {status && parseStatus(status)}
          </div>
        </div>
      </div>
      <div>
        <button onClick={onToggleCollapse}>
          {isCollapsed && <HalfArrowDownIcon />}
          {!isCollapsed && <HalfArrowUpIcon />}
        </button>
      </div>
    </div>
  );
}
