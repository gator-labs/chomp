import { useEffect, useRef } from "react";

export function useOuterClick(callback: () => void) {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        innerRef.current &&
        !innerRef.current.contains(e.target as HTMLElement)
      )
        callback();
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [callback]);

  return innerRef;
}
