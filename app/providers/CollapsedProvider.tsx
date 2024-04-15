"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface CollapsedContextState {
  getIsOpen: (questionId: number) => boolean;
  setClosed: (questionId: number) => void;
  setOpen: (questionId: number) => void;
  toggleCollapsed: (questionId: number) => void;
}

const initialContextValue: CollapsedContextState = {
  getIsOpen: () => false,
  setClosed: () => {},
  setOpen: () => {},
  toggleCollapsed: () => {},
};

export const CollapsedContext =
  createContext<CollapsedContextState>(initialContextValue);

export function CollapsedContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [openQuestionIds, setOpenQuestionIds] = useState<number[]>([]);

  const getIsOpen = useCallback(
    (questionId: number) => openQuestionIds.includes(questionId),
    [openQuestionIds],
  );

  const setClosed = useCallback(
    (questionId: number) =>
      setOpenQuestionIds((prev) =>
        [...prev].filter((qId) => qId !== questionId),
      ),
    [setOpenQuestionIds],
  );

  const setOpen = useCallback(
    (questionId: number) => setOpenQuestionIds((prev) => [questionId, ...prev]),
    [setOpenQuestionIds],
  );

  const toggleCollapsed = useCallback(
    (questionId: number) =>
      setOpenQuestionIds((prev) => {
        if (prev.includes(questionId)) {
          return [...prev].filter((qId) => qId !== questionId);
        }

        return [questionId, ...prev];
      }),
    [setOpenQuestionIds],
  );

  const value = useMemo(
    () => ({
      getIsOpen,
      setClosed,
      setOpen,
      toggleCollapsed,
    }),
    [getIsOpen, setClosed, setOpen, toggleCollapsed],
  );

  return (
    <CollapsedContext.Provider value={value}>
      {children}
    </CollapsedContext.Provider>
  );
}

export const useCollapsedContext = (): CollapsedContextState =>
  useContext(CollapsedContext);
