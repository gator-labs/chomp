import { MouseEventHandler, ReactNode, useRef } from "react";
import { ReactPortal } from "../ReactPortal/ReactPortal";

type FlyoutProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export function Flyout({ isOpen, children, onClose }: FlyoutProps) {
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
        className="fixed top-0 h-full w-full flex justify-end bg-gray-850 bg-opacity-80"
      >
        <div className="bg-gray-700 w-[338px] h-full">{children}</div>
      </div>
    </ReactPortal>
  );
}
