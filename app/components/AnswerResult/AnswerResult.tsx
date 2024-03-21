import { ViewsIcon } from "../Icons/ViewsIcon";

type AnswerResultProps = {
  percentage: number;
  answerText: string;
};

export function AnswerResult({ percentage, answerText }: AnswerResultProps) {
  const percentageCapped = percentage > 100 ? 100 : percentage;
  return (
    <div className="flex items-center gap-1">
      <div
        className={
          "relative rounded-[4px] h-6 bg-search-gray w-full overflow-hidden"
        }
      >
        <div
          className="h-full bg-purple absolute top-0 l-0 w-full"
          style={{
            width: `${percentageCapped}%`,
          }}
        ></div>
        <div className="absolute left-4 top-0 flex items-center py-1 gap-2">
          <ViewsIcon width={14} height={14} fill="#1B1B1B" />
          <span className="text-black text-sm font-sora">{answerText}</span>
        </div>
      </div>
      <div className="text-white text-sm">{percentage}%</div>
    </div>
  );
}
