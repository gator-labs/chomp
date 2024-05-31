import classNames from "classnames";
import { DeckGraphic } from "../Graphics/DeckGraphic";
import { RevealCardInfo } from "../RevealCardInfo/RevealCardInfo";

type StatusUnion = "chomped" | "new" | "continue";
type HomeFeedDeckCardProps = {
  deck: string;
  imageUrl?: string | null;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
  status?: StatusUnion;
  onClick: () => void;
};

const getStatusText = (status: StatusUnion) => {
  switch (status) {
    case "chomped":
      return "Chomped";
    case "continue":
      return "Continue";
    case "new":
      return "New !";
    default:
      return "";
  }
};

export function HomeFeedDeckCard({
  deck,
  imageUrl,
  revealAtDate,
  answerCount,
  revealAtAnswerCount,
  status,
  onClick,
}: HomeFeedDeckCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[#333] border-[#666] rounded-2xl p-4 flex gap-4 cursor-pointer h-full"
    >
      <div className="w-[90px] h-[90px] flex-shrink-0">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} className="w-full h-full object-contain" alt="" />
        ) : (
          <DeckGraphic className="w-full h-full" />
        )}
      </div>
      <div className="flex flex-col justify-between w-full">
        <div className="text-white font-sora font-semibold text-base">
          {deck}
        </div>
        <div className="flex items-center justify-between -ml-1">
          <RevealCardInfo
            answerCount={answerCount}
            revealAtAnswerCount={revealAtAnswerCount}
            revealAtDate={revealAtDate}
          />
          <div
            className={classNames("text-sm leading-6", {
              "text-aqua": status && ["chomped", "continue"].includes(status),
              "text-gray": status === "new",
              underline: status === "continue",
            })}
          >
            {status && getStatusText(status)}
          </div>
        </div>
      </div>
    </div>
  );
}
