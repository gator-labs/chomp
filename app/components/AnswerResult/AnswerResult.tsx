import classNames from "classnames";
import { Avatar } from "../Avatar/Avatar";
import { ViewsIcon } from "../Icons/ViewsIcon";
import PrimarySlider from "../PrimarySlider/PrimarySlider";

type AnswerResultProps = {
  percentage: number;
  handleRatioChange?: (percentage: number) => void;
  answerText: string;
  valueSelected?: number | null;
  avatarSrc?: string;
  progressBarClassName?: string;
  progressColor?: string;
};

export function AnswerResult({
  percentage,
  answerText,
  handleRatioChange,
  valueSelected,
  avatarSrc,
  progressBarClassName,
  progressColor,
}: AnswerResultProps) {
  const avatarLeft = valueSelected
    ? valueSelected > 90
      ? "calc(100% - 16px)"
      : `${valueSelected}%`
    : undefined;

  return (
    <div className="flex items-center gap-1">
      <div
        className={
          "relative rounded-[4px] h-6 bg-search-gray w-full overflow-hidden"
        }
      >
        <PrimarySlider
          value={percentage}
          setValue={handleRatioChange}
          hideThumb
          className={`rounded-[4px] h-full w-full`}
          backgroundColor="#4c4c4c"
          progressColor={progressColor ? progressColor : "#cfc7f2"}
          trackClassName={classNames(
            "!rounded-[4px] h-full w-full",
            progressBarClassName,
          )}
          rangeClassName="!rounded-[4px] h-full"
        />
        {valueSelected !== undefined && valueSelected !== null && avatarSrc && (
          <Avatar
            src={avatarSrc}
            size="extrasmall"
            className="absolute top-1 "
            style={{ left: avatarLeft }}
          />
        )}
        <div className="absolute left-4 top-0 flex items-center py-1 gap-2">
          <ViewsIcon width={14} height={14} fill="#1B1B1B" />
          <span className="text-black text-sm font-sora">{answerText}</span>
        </div>
      </div>
      <div className="text-white text-sm w-6">{percentage}%</div>
    </div>
  );
}
