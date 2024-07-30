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
    <div className="bg-[#333333] p-4 rounded">
      <div className="font-sora text-base text-white mb-2">Poll Results</div>
      {children}
      {optionSelected &&
        percentageSelected !== undefined &&
        resultProgressComponent && (
          <>
            <div className="w-full h-[1px] bg-[#666666] my-2"></div>
            <div className="flex gap-3.5">
              <div className="bg-[#A3A3EC] min-w-10 h-10 flex justify-center items-center text-sm font-sora font-bold rounded-lg">
                <Avatar src={avatarSrc || AvatarPlaceholder.src} size="small" />
              </div>
              {cloneElement(resultProgressComponent, {
                text: (
                  <div
                    className={classNames(
                      "text-aqua text-sm font-bold z-10 flex items-center gap-1",
                      { "text-warning": !isCorrect },
                    )}
                  >
                    <div>You guessed {percentageSelected}% for </div>
                    <div className="text-black bg-white py-1 px-2 rounded-full">
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
