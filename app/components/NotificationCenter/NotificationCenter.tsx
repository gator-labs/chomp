import { revealQuestion } from "@/app/actions/chompResult";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { RevealedQuestion } from "@/app/queries/home";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { BellIcon } from "../Icons/BellIcon";
import { CloseIcon } from "../Icons/CloseIcon";
import { RevealFeedQuestionCard } from "../RevealFeedQuestionCard/RevealFeedQuestionCard";

type NotificationCenterProps = {
  questions: RevealedQuestion[];
};

const NotificationCenter = ({ questions }: NotificationCenterProps) => {
  const { openRevealModal } = useRevealedContext();

  const [isOpen, setIsOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();

  const toggleSheet = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    if (
      sheetRef.current &&
      !sheetRef.current.contains(event.target as Node) &&
      bellButtonRef.current &&
      !bellButtonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleReveal = ({
    revealTokenAmount,
    id,
  }: {
    revealTokenAmount: number;
    id: number;
  }) => {
    openRevealModal(
      async (burnTx?: string, nftAddress?: string) => {
        await revealQuestion(id, burnTx, nftAddress);
        router.push("/application/answer/reveal/" + id);
        router.refresh();
      },
      revealTokenAmount,
      id,
    );
  };

  return (
    <div className="w-max h-full flex items-center justify-center">
      <button
        ref={bellButtonRef}
        onClick={toggleSheet}
        style={styles.bellButton}
      >
        <div className="relative w-max h-max">
          <BellIcon width={16} height={18} />
          {questions.length > 0 && (
            <div className="w-1.5 h-1.5 bg-[#ED6A5A] rounded-full top-0.5 right-0 z-2 absolute"></div>
          )}
        </div>
      </button>
      <div
        ref={sheetRef}
        style={{ ...styles.sheet, ...(isOpen ? styles.sheetOpen : {}) }}
        className="px-3 py-2 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold leading-[20.16px] text-left">
            Notifications
          </h2>
          <CloseIcon
            onClick={() => {
              setIsOpen(false);
            }}
            className="cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-3 overflow-scroll">
          {questions.map((question) => {
            return (
              <RevealFeedQuestionCard
                key={question.id}
                {...question}
                closeNotificationCenter={() => {
                  setIsOpen(false);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  bellButton: {
    border: "none",
    background: "none",
    cursor: "pointer",
  },
  sheet: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "338px",
    height: "100%",
    backgroundColor: "#4D4D4D",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease-in-out",
    padding: "20px",
    zIndex: 1000,
  },
  sheetOpen: {
    transform: "translateX(0)",
  },
};

export default NotificationCenter;
