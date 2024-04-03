import { useEffect, useState } from "react";

interface WindowSize {
  width: number;
  height: number;
}

const IS_SERVER = typeof window === "undefined";

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: IS_SERVER ? 0 : window.innerWidth,
    height: IS_SERVER ? 0 : window.innerHeight,
  });

  useEffect(() => {
    function handleSize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    addEventListener("resize", handleSize);

    return () => {
      removeEventListener("resize", handleSize);
    };
  });

  return windowSize;
}
