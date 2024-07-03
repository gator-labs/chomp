import { useCallback, useState } from "react";
import { useToast } from "../providers/ToastProvider";

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

interface HandleCopyParams {
  text: string;
  infoText?: string;
  errorText?: string;
}

export function useCopyToClipboard(): {
  copiedText: CopiedValue;
  copy: CopyFn;
  handleCopy: ({
    text,
    infoText,
    errorText,
  }: HandleCopyParams) => Promise<void>;
} {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const { errorToast, infoToast } = useToast();

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  }, []);

  const handleCopy = async ({
    text,
    infoText = "Text copied to clipboard!",
    errorText = '"Failed to copy!"',
  }: HandleCopyParams) => {
    try {
      await copy(text);
      infoToast(infoText);
    } catch (error) {
      errorToast(errorText);
    }
  };

  return { copiedText, copy, handleCopy };
}
