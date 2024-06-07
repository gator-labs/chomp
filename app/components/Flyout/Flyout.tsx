import { MouseEventHandler, ReactNode, useEffect, useRef } from "react";
import { ReactPortal } from "../ReactPortal/ReactPortal";

type FlyoutProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export function Flyout({ isOpen, children, onClose }: FlyoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscapeKey(event: { key: string }) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        contentRef.current.classList.add("open");
      } else {
        contentRef.current.classList.remove("open");
      }
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClickOutside: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target === ref.current) {
      onClose();
    }
  };

  return (
    <ReactPortal>
      <div
        ref={ref}
        onClick={handleClickOutside}
        className="fixed top-0 h-full w-full flex justify-end bg-black bg-opacity-80"
      >
        <div className="bg-search-gray w-[338px] h-full">{children}</div>
      </div>
    </ReactPortal>
  );
}
