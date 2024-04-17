import { ReactNode, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

type ReactPortalProps = {
  children: ReactNode;
  wrapperId?: string;
};

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement("div");
  wrapperElement.setAttribute("id", wrapperId);
  wrapperElement.setAttribute("class", "fixed z-[100]");
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

export function ReactPortal({
  children,
  wrapperId = "react-portal-wrapper",
}: ReactPortalProps) {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(
    null,
  );

  useLayoutEffect(() => {
    let element = document.getElementById(wrapperId);
    let isCreatedInComponent = false;
    if (!element) {
      isCreatedInComponent = true;
      element = createWrapperAndAppendToBody(wrapperId);
    }

    setWrapperElement(element);

    return () => {
      if (isCreatedInComponent) {
        element?.remove();
      }
    };
  }, [wrapperId]);

  if (wrapperElement === null) return null;

  return createPortal(children, wrapperElement);
}
