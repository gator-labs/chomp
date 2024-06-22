import { MouseEventHandler, ReactNode, useRef } from "react";
import { CloseIcon } from "../Icons/CloseIcon";
import { ReactPortal } from "../ReactPortal/ReactPortal";

type ModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export function Modal({ title, isOpen, children, onClose }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  if (!isOpen) {
    return null;
  }

  const handleClickoutside: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target === ref.current) {
      onClose();
    }
  };

  return (
    <ReactPortal>
      <div
        ref={ref}
        onClick={handleClickoutside}
        className="fixed top-0 h-full w-full flex justify-center items-center bg-black bg-opacity-80"
      >
        <div className="bg-[#333] m-4 w-full max-w-md p-4 rounded-md border-[1px] border-[#666]">
          <div className="flex justify-between items-center mb-4">
            <div className="text-base font-bold font-sora text-white">
              {title}
            </div>
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
