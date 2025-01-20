"use client";

import { ReactNode, createContext, useContext } from "react";
import { ErrorIcon } from "react-hot-toast";
import { Toaster, ToasterProps, toast } from "sonner";

import { InfoIcon } from "../components/Icons/ToastIcons/InfoIcon";
import { RemoveIcon } from "../components/Icons/ToastIcons/RemoveIcon";
import { SpinnerIcon } from "../components/Icons/ToastIcons/SpinnerIcon";
import { SuccessIcon } from "../components/Icons/ToastIcons/SuccessIcon";

type ToastContextType = {
  successToast: (message: string, description?: string) => void;
  infoToast: (message: string, description?: string) => void;
  errorToast: (message: string | ReactNode, description?: string) => void;
  defaultToast: (message: string) => void;
  promiseToast: <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string | React.ReactNode;
      description?: string;
    },
  ) => Promise<T>;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const toastOptions: ToasterProps = {
  position: "top-center",
  expand: true,
  gap: 14,
  duration: 4000,
  style: {
    width: "358px",
    height: "75px",
    border: "none",
    background: "#1B1B1B",
    padding: "0",
    animation: "fade 0.3s",
    borderRadius: "8px",
  },
};

const toastLayout = (
  IconComponent: React.ElementType,
  message: string | React.ReactNode,
  description?: string,
) => (
  <div className="flex gap-6 items-center text-gray-50 justify-between p-6 border border-purple-200 rounded-[8px] w-[358px] h-[75] bg-gray-800 relative overflow-hidden">
    <div>
      <IconComponent />
    </div>
    <div>
      <h4>{message}</h4>
      {description && <p>{description}</p>}
    </div>
    <div className="cursor-pointer" onClick={() => toast.dismiss()}>
      <RemoveIcon />
    </div>
    <div className="absolute bottom-0 h-[5px] left-0 bg-purple-300 animate-loadingLine"></div>
  </div>
);

export const successToastLayout = (message: string, description?: string) =>
  toastLayout(SuccessIcon, message, description);

const infoToastLayout = (message: string, description?: string) =>
  toastLayout(InfoIcon, message, description);

export const errorToastLayout = (
  message: string | React.ReactNode,
  description?: string,
) => {
  return toastLayout(ErrorIcon, message, description);
};

const defaultToastLayout = (message: string) =>
  toastLayout(SuccessIcon, message);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const successToast = (message: string, description?: string) => {
    const toastId = toast(successToastLayout(message, description), {
      ...toastOptions,
    });

    // Automatically dismiss the toast after the duration specified in toastOptions
    setTimeout(() => {
      toast.dismiss(toastId);
    }, toastOptions.duration);
  };

  const infoToast = (message: string, description?: string) => {
    toast(infoToastLayout(message, description), toastOptions);
  };

  const errorToast = (message: string | ReactNode, description?: string) => {
    const toastId = toast(errorToastLayout(message, description), {
      ...toastOptions,
    });

    setTimeout(() => {
      toast.dismiss(toastId);
    }, toastOptions.duration);
  };

  const defaultToast = (message: string) => {
    toast(defaultToastLayout(message), toastOptions);
  };

  const promiseToast = <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string | React.ReactNode;
      description?: string;
    },
  ) => {
    // Show the loading toast
    const toastId = toast(toastLayout(SpinnerIcon, msgs.loading), toastOptions);

    // Handle the promise resolution or rejection
    promise
      .then(() => {
        // Dismiss the current toast
        toast.dismiss(toastId);
        // Show success toast
        toast(successToastLayout(msgs.success, msgs.description), toastOptions);
      })
      .catch(() => {
        // Dismiss the current toast
        toast.dismiss(toastId);
        // Show error toast
        toast(errorToastLayout(msgs.error, msgs.description), toastOptions);
      });

    return promise;
  };

  return (
    <ToastContext.Provider
      value={{
        successToast,
        infoToast,
        errorToast,
        promiseToast,
        defaultToast,
      }}
    >
      {children}
      <Toaster {...toastOptions} />
    </ToastContext.Provider>
  );
};
