"use client";
import { ReactNode, createContext, useContext, useEffect } from "react";
import toast, { ToastOptions, Toaster, useToaster } from "react-hot-toast";
import AnimatedTimer from "../components/AnimatedTimer/AnimatedTimer";
import { ErrorIcon } from "../components/Icons/ToastIcons/ErrorIcon";
import { InfoIcon } from "../components/Icons/ToastIcons/InfoIcon";
import { SpinnerIcon } from "../components/Icons/ToastIcons/SpinnerIcon";
import { SuccessIcon } from "../components/Icons/ToastIcons/SuccessIcon";

type ToastContextType = {
  successToast: (
    message: string,
    description?: string,
    options?: ToastOptions,
  ) => void;
  infoToast: (
    message: string,
    description?: string,
    options?: ToastOptions,
  ) => void;
  errorToast: (
    message: string,
    description?: string,
    options?: ToastOptions,
  ) => void;
  defaultToast: (message: string, options?: ToastOptions) => void;
  promiseToast: <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
      description?: string;
      isChompLoader?: boolean;
    },
    options?: ToastOptions,
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

const toastOptions: ToastOptions = {
  style: {
    borderRadius: "8px",
    backgroundColor: "#1B1B1B",
    color: "#fff",
    padding: "16px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "358px",
    minWidth: "358px",
    border: "1px solid #A3A3EC",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  position: "top-center",
  duration: 5000,
};

// Unified Toast Layout Function
const toastLayout = (
  IconComponent: React.ElementType,
  message: string,
  description?: string,
  id?: string,
) => (
  <div style={{ ...toastOptions.style }}>
    <div className="flex items-center gap-2">
      <IconComponent height={26} width={26} />
      <div className="flex flex-col">
        <h4 className="text-sm font-bold text-left">{message}</h4>
        {description && (
          <p className="text-xs text-left text-gray-400">{description}</p>
        )}
      </div>
    </div>
    {id && <AnimatedTimer id={id} />}
  </div>
);

const successToastLayout = (
  message: string,
  id: string,
  description?: string,
) => toastLayout(SuccessIcon, message, description, id);

const infoToastLayout = (message: string, id: string, description?: string) =>
  toastLayout(InfoIcon, message, description, id);

const errorToastLayout = (message: string, id: string, description?: string) =>
  toastLayout(ErrorIcon, message, description, id);

const defaultToastLayout = (message: string, id: string) =>
  toastLayout(SuccessIcon, message, undefined, id); // Using SuccessIcon as a placeholder for default

// Loading Toast Layout without AnimatedTimer
const loadingToastLayout = (message: string, description?: string) => (
  <div style={{ ...toastOptions.style }}>
    <div className="flex items-center gap-2">
      <SpinnerIcon height={26} width={26} />
      <div className="flex flex-col">
        <h4 className="text-sm font-bold text-left">{message}</h4>
        {description && (
          <p className="text-xs text-left text-gray-400">{description}</p>
        )}
      </div>
    </div>
  </div>
);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { toasts } = useToaster();

  useEffect(() => {
    const toastsToRemove = toasts.filter((toast) => !toast.visible);

    toastsToRemove.map((toastToRemove) => toast.remove(toastToRemove.id));
  }, [toasts]);

  const successToast = (
    message: string,
    description?: string,
    options?: ToastOptions,
  ) => {
    toast.custom((t) => successToastLayout(message, t.id, description), {
      ...toastOptions,
      ...options,
    });
  };

  const infoToast = (
    message: string,
    description?: string,
    options?: ToastOptions,
  ) => {
    toast.custom((t) => infoToastLayout(message, t.id, description), {
      ...toastOptions,
      ...options,
    });
  };

  const errorToast = (
    message: string,
    description?: string,
    options?: ToastOptions,
  ) => {
    toast.custom((t) => errorToastLayout(message, t.id, description), {
      ...toastOptions,
      ...options,
    });
  };

  const defaultToast = (message: string, options?: ToastOptions) => {
    toast.custom((t) => defaultToastLayout(message, t.id), {
      ...toastOptions,
      ...options,
    });
  };

  const promiseToast = <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
      description?: string;
      isChompLoader?: boolean;
    },
    options?: ToastOptions,
  ) => {
    // Show the loading toast
    const toastId = toast.custom(
      () => loadingToastLayout(msgs.loading, msgs.description),
      options,
    );

    // Handle the promise resolution or rejection
    promise
      .then(() => {
        toast.custom(
          (t) =>
            successToastLayout(
              msgs.success,
              t.id, // Ensure we pass the correct id to use AnimatedTimer
              msgs.description,
            ),
          {
            id: toastId,
            ...toastOptions,
            ...options,
          },
        );
      })
      .catch(() => {
        toast.custom(
          (t) =>
            errorToastLayout(
              msgs.error,
              t.id, // Ensure we pass the correct id to use AnimatedTimer
              msgs.description,
            ),
          {
            id: toastId,
            ...toastOptions,
            ...options,
          },
        );
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
      <Toaster />
    </ToastContext.Provider>
  );
};
