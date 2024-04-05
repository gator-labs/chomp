import { ReactNode } from "react";
import { CloseIcon } from "../Icons/CloseIcon";
import { ReactPortal } from "../ReactPortal/ReactPortal";

type ModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export function Modal({ title, isOpen, children, onClose }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <ReactPortal>
      <div className="fixed top-0 h-full w-full flex justify-center items-center">
        <div className="bg-[#333] w-72 p-4 rounded-md border-[1px] border-[#666]">
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
          <div>{children}</div>
        </div>
      </div>
    </ReactPortal>
  );
}
