import { ReactNode, useCallback, useState } from "react";
import { ImageIcon } from "../Icons/ImageIcon";
import Link from "next/link";
import { CountdownIcon } from "../Icons/CountdownIcon";
import classNames from "classnames";
import { useInterval } from "../../hooks/useInterval";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

type QuestionCardProps = {
  question: string;
  dueAt: Date;
  step: number;
  numberOfSteps: number;
  viewImageSrc?: string;
  children?: ReactNode;
};

const ONE_SECOND_IN_MILISECONDS = 1000;

dayjs.extend(duration);
const getDueAtString = (dueAt: Date) => {
  const miliseconds = dayjs(dueAt).diff(new Date());
  if (miliseconds <= 0) {
    return "0:00";
  }

  return dayjs.duration(miliseconds).format("m:ss");
};

export function QuestionCard({
  question,
  children,
  viewImageSrc,
  numberOfSteps,
  step,
  dueAt,
}: QuestionCardProps) {
  const [dueAtFormatted, setDueAtFormatted] = useState<string>(
    getDueAtString(dueAt)
  );
  const handleDueAtFormatted = useCallback(() => {
    setDueAtFormatted(getDueAtString(dueAt));
  }, [setDueAtFormatted, dueAt]);

  useInterval(handleDueAtFormatted, ONE_SECOND_IN_MILISECONDS);

  return (
    <div className="bg-[#333] min-h-[304px] w-full rounded-xl px-4 py-6 flex flex-col justify-between">
      <div className="text-white font-sora font-semibold text-base">
        {question}
      </div>
      <div>{children}</div>
      <div>
        {viewImageSrc && (
          <div className="flex items-center gap-[6px] mb-1">
            <ImageIcon />
            <Link
              href={viewImageSrc}
              className="underline text-white font-sora font-light text-sm"
            >
              View Image
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CountdownIcon fill="#999" />
            <span className="text-white font-sora text-sm !leading-[14px] font-light">
              {dueAtFormatted}
            </span>
          </div>
          <div className="flex gap-x-[10px]">
            {Array.from(Array(numberOfSteps).keys()).map((_, index) => (
              <div
                key={index}
                className={classNames("rounded-full w-2 h-2", {
                  "bg-[#CFC5F7]": index + 1 <= step,
                  "bg-white": index + 1 > step,
                })}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
