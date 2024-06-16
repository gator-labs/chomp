"use client";
import { revealQuestion } from "@/app/actions/chompResult";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { RevealedQuestion } from "@/app/queries/home";
import { getRevealedAtString } from "@/app/utils/dateUtils";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { BellIcon } from "../Icons/BellIcon";
import { ClockIcon } from "../Icons/ClockIcon";
import { CloseIcon } from "../Icons/CloseIcon";
import { ViewsIcon } from "../Icons/ViewsIcon";

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

  const handleClickOutside = (event: MouseEvent) => {
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
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
              <div
                key={question.id}
                className="bg-btn-border-black rounded-lg border-[0.5px] border-solid border-[#666666] p-3 flex flex-col gap-1.5"
              >
                <div className="text-[13px] font-normal leading-[16.38px] text-left min-h-[3rem]">
                  {question.question}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-start gap-1">
                    <ClockIcon width={18} height={18} />
                    <span className="text-[10px] font-light leading-[12.6px] text-left">
                      {getRevealedAtString(question.revealAtDate!)}
                    </span>
                  </div>
                  <span className="text-[10px] font-light leading-[12.6px] text-left text-aqua">
                    Chomped
                  </span>
                </div>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    handleReveal({
                      revealTokenAmount: question.revealTokenAmount!,
                      id: question.id,
                    });
                  }}
                  variant="grayish"
                  className="!py-3"
                >
                  <div className="flex justify-center gap-1 items-center text-white">
                    <div>Reveal</div>
                    <ViewsIcon />
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Define the styles object with CSSProperties type
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
