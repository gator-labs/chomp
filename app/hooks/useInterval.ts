import { useEffect, useRef } from "react";

import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

// useInterval creates a recurring timer that safely handles callback changes
// - Stores the callback in a ref to avoid unnecessary interval resets
// - Only creates/clears the interval when the delay changes
// - Passing null as delay disables the interval
// - Uses useIsomorphicLayoutEffect to update the callback reference synchronously
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    // The cleanup function (returned by the `useEffect`) will be called in these scenarios:
    // 1. When the component using this hook unmounts
    // 2. Before the effect runs again if the `delay` dependency changes
    return () => {
      clearInterval(id);
    };
  }, [delay]);
}
