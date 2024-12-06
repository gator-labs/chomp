import { PropsWithChildren } from "react";
import { RemoveScroll } from "react-remove-scroll";

type MysteryBoxOverlayProps = PropsWithChildren;

function MysteryBoxOverlay({ children }: MysteryBoxOverlayProps) {
  return (
    <RemoveScroll>
      <div className="fixed inset-0 z-100 bg-black/90 mt-10 z-0 flex justify-center overflow-y-scroll mb-20">
        {children}
      </div>
    </RemoveScroll>
  );
}

export default MysteryBoxOverlay;
