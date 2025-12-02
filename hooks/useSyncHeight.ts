import { useLayoutEffect, useState } from "react";

export function useSyncHeight(ref: any, initial = 0) {
  const [height, setHeight] = useState(initial);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}
