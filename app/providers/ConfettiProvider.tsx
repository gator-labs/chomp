"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Props as ConfettiOptions } from "react-confetti";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

interface ConfettiProps extends ConfettiOptions {
  duration?: number;
}

interface ConfettiContextState {
  fire: (newProps?: ConfettiProps, duration?: number) => void;
}

const initialContextValue = {
  fire: () => {},
};

export const ConfettiContext =
  createContext<ConfettiContextState>(initialContextValue);

const defaultConfettiProps = {
  numberOfPieces: 140,
  recycle: true,
  run: false,
};

const CONFETTI_DURATION = 5000;
const UNMOUNT_DELAY = 2000;

const ConfettiProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [confettiProps, setConfettiProps] =
    useState<ConfettiProps>(defaultConfettiProps);
  const [isVisible, setIsVisible] = useState(false);

  const fire = useCallback(() => {
    setIsVisible(true);
    setConfettiProps((prevProps) => ({
      ...prevProps,
      run: true,
      recycle: true,
    }));
    const finishRecycling = setTimeout(() => {
      setConfettiProps((prevProps) => ({ ...prevProps, recycle: false }));
    }, CONFETTI_DURATION);
    const unmountConfetti = setTimeout(() => {
      setIsVisible(false);
    }, CONFETTI_DURATION + UNMOUNT_DELAY);
    return () => {
      clearTimeout(finishRecycling);
      clearTimeout(unmountConfetti);
    };
  }, []);

  const value = useMemo(() => ({ fire }), [fire]);

  return (
    <ConfettiContext.Provider value={value}>
      {children}
      {isVisible && (
        <Confetti
          className="absolute top-0 left-0 w-full h-full"
          {...confettiProps}
        />
      )}
    </ConfettiContext.Provider>
  );
};

export default ConfettiProvider;

export const useConfetti = (): ConfettiContextState =>
  useContext(ConfettiContext);
