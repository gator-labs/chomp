import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import classNames from "classnames";
import { cloneElement, ReactElement } from "react";
import { Avatar } from "../Avatar/Avatar";

type PollResultProps = {
  optionSelected?: string;
  resultProgressComponent?: ReactElement;
  percentageSelected?: number;
  avatarSrc?: string;
  isCorrect?: boolean;
  children?: ReactElement;
};

export default function PollResult({
  optionSelected,
  resultProgressComponent,
  percentageSelected,
  avatarSrc,
  isCorrect,
  children,
}: PollResultProps) {
  return (
    <div className="bg-gray-700 p-4 rounded">
      <div className="text-base text-white mb-2">
        What other people predicted
      </div>
      {children}
      {optionSelected &&
        percentageSelected !== undefined &&
        resultProgressComponent && (
          <>
            <div className="text-base text-white my-2">What you predicted</div>
            <div className="flex gap-3.5">
              <div className="bg-purple-500 min-w-10 h-10 flex justify-center items-center text-sm  font-bold rounded-lg">
                <Avatar src={avatarSrc || AvatarPlaceholder.src} size="small" />
              </div>
              {cloneElement(resultProgressComponent, {
                text: (
                  <div
                    className={classNames(
                      "text-aqua text-sm font-bold z-10 flex items-center gap-1",
                      { "text-destructive": !isCorrect },
                    )}
                  >
                    <div>You guessed {percentageSelected}% for </div>
                    <div className="text-gray-800 bg-white py-1 px-2 rounded-full">
                      {optionSelected}
                    </div>
                  </div>
                ),
                percentage: percentageSelected,
                disablePercentageLabel: true,
              })}
            </div>
          </>
        )}
    </div>
  );
}
