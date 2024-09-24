import { MouseEventHandler, ReactNode, useRef } from "react";
import { CloseIcon } from "../Icons/CloseIcon";
import { ReactPortal } from "../ReactPortal/ReactPortal";

type ModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  variant?: "image-only" | "normal";
};

export function Modal({
  title,
  isOpen,
  children,
  onClose,
  variant = "normal",
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  if (!isOpen) {
    return null;
  }

  const handleClickoutside: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target === ref.current) {
      onClose();
    }
  };

  if (variant === "image-only") {
    return (
      <ReactPortal>
        <div
          ref={ref}
          onClick={handleClickoutside}
          className="fixed top-0 h-full w-full flex justify-center items-center bg-gray-800 bg-opacity-95"
        >
          <div className="m-4 w-full max-w-md">
            <div className="flex justify-end items-center mb-2">
              <div className="flex items-center">
                <button onClick={onClose}>
                  <CloseIcon width={24} height={24} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center border-gray-500 rounded-md border-[1px] overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </ReactPortal>
    );
  }

  return (
    <ReactPortal>
      <div
        ref={ref}
        onClick={handleClickoutside}
        className="fixed top-0 h-full w-full flex justify-center items-center bg-gray-800 bg-opacity-80"
      >
        <div className="bg-gray-700 m-4 w-full max-w-md p-4 rounded-md border-[1px] border-gray-500">
          <div className="flex justify-between items-center mb-4">
            <div className="text-base font-bold  text-white">{title}</div>
            <div className="flex items-center">
              <button onClick={onClose}>
                <CloseIcon width={18} height={18} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center">{children}</div>
        </div>
      </div>
    </ReactPortal>
  );
}
