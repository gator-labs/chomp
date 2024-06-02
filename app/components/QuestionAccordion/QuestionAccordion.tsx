import classNames from "classnames";
import { ReactNode } from "react";
import { getRevealedAtString } from "../../utils/dateUtils";
import { ClockIcon } from "../Icons/ClockIcon";
import { CloseIcon } from "../Icons/CloseIcon";
import { ExpandIcon } from "../Icons/ExpandIcon";

type StatusUnion = "chomped" | "new";
type QuestionAccordionProps = {
  question: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  status?: StatusUnion;
  revealedAt?: Date | null;
  children?: ReactNode;
  actionChild?: ReactNode;
  revealAtAnswerCount?: Number | null;
  answerCount?: Number;
  onClick?: () => void;
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

export function QuestionAccordion({
  question,
  isCollapsed = true,
  onToggleCollapse,
  revealedAt,
  actionChild,
  children,
  status,
  revealAtAnswerCount,
  answerCount,
  onClick,
}: QuestionAccordionProps) {
  const isRevealAtCount =
    answerCount !== undefined &&
    revealAtAnswerCount !== undefined &&
    revealAtAnswerCount !== null;
  return (
    <div
      className={classNames(
        "bg-[#333] border-[#666] rounded-2xl p-4 flex gap-2",
        {
          "cursor-pointer": !!onClick,
        },
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-y-2 w-full">
        <div className="text-white text-base font-sora font-semibold">
          {question}
        </div>
        {!isCollapsed && children && (
          <div className="mt-6 mb-4">{children}</div>
        )}
        {actionChild}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <>
              <ClockIcon />
              <div>
                {revealedAt && (
                  <span className="text-sm text-white">
                    {getRevealedAtString(revealedAt)}{" "}
                  </span>
                )}
                {revealedAt && isRevealAtCount && (
                  <span className="text-sm text-white">or </span>
                )}
                {isRevealAtCount && (
                  <span className="text-sm text-white">
                    {answerCount.toString()}/{revealAtAnswerCount.toString()}
                  </span>
                )}
              </div>
            </>
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
        {children && (
          <button onClick={onToggleCollapse}>
            {isCollapsed ? (
              <div className="w-6 h-6 flex justify-center items-center">
                <ExpandIcon width={16} height={16} />
              </div>
            ) : (
              <CloseIcon />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
