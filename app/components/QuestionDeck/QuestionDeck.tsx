import classNames from "classnames";
import { getRevealedAtString } from "../../utils/dateUtils";
import { DeckGraphic } from "../Graphics/DeckGraphic";
import { ClockIcon } from "../Icons/ClockIcon";

type StatusUnion = "chomped" | "new" | "continue";
type QuestionDeckProps = {
  text: string;
  imageUrl?: string | null;
  revealedAt?: Date | null;
  status?: StatusUnion;
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

export function QuestionDeck({
  text,
  imageUrl,
  revealedAt,
  status,
}: QuestionDeckProps) {
  return (
    <div className="bg-[#333] border-[#666] rounded-2xl p-4 flex gap-4">
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
          {text}
        </div>
        <div className="flex items-center justify-between -ml-1">
          <div className="flex items-center gap-2.5">
            {revealedAt && (
              <>
                <ClockIcon />
                <span className="text-white text-sm">
                  {getRevealedAtString(revealedAt)}
                </span>
              </>
            )}
          </div>
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
