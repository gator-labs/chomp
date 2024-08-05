"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export function useCrossTabState<T>(
  stateKey: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(defaultValue);
  const isNewSession = useRef(true);

  useEffect(() => {
    if (isNewSession.current) {
      const currentState = localStorage.getItem(stateKey);
      if (currentState) {
        setState(JSON.parse(currentState));
      } else {
        setState(defaultValue);
      }
      isNewSession.current = false;
      return;
    }
    try {
      localStorage.setItem(stateKey, JSON.stringify(state));
    } catch (error) {
      // Handle error if necessary
    }
  }, [state, stateKey, defaultValue]);

  useEffect(() => {
    const onReceiveMessage = (e: StorageEvent) => {
      const { key, newValue } = e;
      if (key === stateKey && newValue !== null) {
        setState(JSON.parse(newValue));
      }
    };

    window.addEventListener("storage", onReceiveMessage);
    return () => window.removeEventListener("storage", onReceiveMessage);
  }, [stateKey]);

  return [state, setState];
}
