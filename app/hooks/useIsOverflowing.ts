import { RefObject, useCallback, useEffect, useState } from "react";

export default function useIsOverflowing(ref: RefObject<HTMLElement>): boolean {
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    const { current } = ref;
    if (current) {
      const hasOverflow =
        current.scrollHeight > current.clientHeight ||
        current.scrollWidth > current.clientWidth;
      setIsOverflowing(hasOverflow);
    }
  }, [ref]);

  useEffect(() => {
    const { current } = ref;
    if (current) {
      checkOverflow();

      window.addEventListener("resize", checkOverflow);
      return () => {
        window.removeEventListener("resize", checkOverflow);
      };
    }
  }, [ref, checkOverflow]);

  return isOverflowing;
}
