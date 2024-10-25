import classNames from "classnames";

import { Avatar } from "../Avatar/Avatar";
import PrimarySlider from "../PrimarySlider/PrimarySlider";
import { OPTION_LABEL } from "./constants";

type AnswerResultProps = {
  percentage: number;
  handleRatioChange?: (percentage: number) => void;
  answerText: string;
  index: number;
  valueSelected?: number | null;
  avatarSrc?: string;
  progressBarClassName?: string;
  progressColor?: string;
  selected?: boolean;
};

export function AnswerResult({
  percentage,
  answerText,
  handleRatioChange,
  valueSelected,
  avatarSrc,
  progressBarClassName,
  progressColor,
  index,
  selected,
}: AnswerResultProps) {
  const avatarLeft = valueSelected
    ? valueSelected > 90
      ? "calc(100% - 16px)"
      : `${valueSelected}%`
    : undefined;

  return (
    <div className="flex items-stretch gap-3 min-h-10">
      <div
        className={classNames(
          "w-10 bg-gray-600 rounded-lg flex items-center justify-center",
          { "bg-purple-500": selected },
        )}
      >
        <p
          className={classNames("text-sm font-bold text-white", {
            "!text-gray-800": selected,
          })}
        >
          {OPTION_LABEL[index as keyof typeof OPTION_LABEL]}
        </p>
      </div>
      <div
        className={
          "text-sm font-light text-white border-gray-500 border-[1px] rounded-lg flex text-left flex-1 !m-0 relative overflow-hidden"
        }
      >
        <PrimarySlider
          value={percentage}
          setValue={handleRatioChange}
          hideThumb
          className={`rounded-[4px] w-full ${answerText.length > 20 ? "min-h-20" : "min-h-10"}`}
          backgroundColor="#4c4c4c"
          progressColor={progressColor ? progressColor : "#A3A3EC"}
          trackClassName={classNames(
            "!rounded-[4px] min-h-10 w-full",
            progressBarClassName,
          )}
          rangeClassName="!rounded-[4px] min-h-10"
        />
        {valueSelected !== undefined && valueSelected !== null && avatarSrc && (
          <Avatar
            src={avatarSrc}
            size="extrasmall"
            className="absolute top-1 "
            style={{ left: avatarLeft }}
          />
        )}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center py-1 gap-2">
          <span className="text-white text-sm ">{answerText}</span>
        </div>
      </div>
    </div>
  );
}
