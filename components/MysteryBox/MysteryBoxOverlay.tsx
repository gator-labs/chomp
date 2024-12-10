import { PropsWithChildren } from "react";
import { RemoveScroll } from "react-remove-scroll";

type MysteryBoxOverlayProps = PropsWithChildren;

function MysteryBoxOverlay({ children }: MysteryBoxOverlayProps) {
  return (
    <RemoveScroll>
      <div className="fixed inset-0 z-[999] bg-black/90 flex justify-center">
        {children}
      </div>
    </RemoveScroll>
  );
}

export default MysteryBoxOverlay;
