"use client";
import { ReactNode, createContext, useContext } from "react";
import toast, { ToastOptions, Toaster } from "react-hot-toast";
import AnimatedTimer from "../components/AnimatedTimer/AnimatedTimer";
import { ErrorIcon } from "../components/Icons/ToastIcons/ErrorIcon";
import { InfoIcon } from "../components/Icons/ToastIcons/InfoIcon";
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
    },
    options?: ToastOptions,
  ) => void;
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
  },
  position: "top-center",
  duration: 5000,
};

const successToastLayout = (
  message: string,
  id: string,
  description?: string,
) => (
  <div style={{ ...toastOptions.style }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <SuccessIcon height={26} width={26} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h4
          style={{
            fontSize: "13px",
            fontWeight: "bold",
            lineHeight: "16.38px",
            textAlign: "left",
          }}
        >
          {message}
        </h4>
        {description && (
          <p
            style={{
              fontSize: "10px",
              fontWeight: "normal",
              lineHeight: "12.6px",
              textAlign: "left",
              color: "#999999",
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
    <AnimatedTimer id={id} />
  </div>
);

const infoToastLayout = (message: string, id: string, description?: string) => (
  <div style={{ ...toastOptions.style }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <InfoIcon height={26} width={26} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h4
          style={{
            fontSize: "13px",
            fontWeight: "bold",
            lineHeight: "16.38px",
            textAlign: "left",
          }}
        >
          {message}
        </h4>
        {description && (
          <p
            style={{
              fontSize: "10px",
              fontWeight: "normal",
              lineHeight: "12.6px",
              textAlign: "left",
              color: "#999999",
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
    <AnimatedTimer id={id} />
  </div>
);

const errorToastLayout = (
  message: string,
  id: string,
  description?: string,
) => (
  <div style={{ ...toastOptions.style }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <ErrorIcon height={26} width={26} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h4
          style={{
            fontSize: "13px",
            fontWeight: "bold",
            lineHeight: "16.38px",
            textAlign: "left",
          }}
        >
          {message}
        </h4>
        {description && (
          <p
            style={{
              fontSize: "10px",
              fontWeight: "normal",
              lineHeight: "12.6px",
              textAlign: "left",
              color: "#999999",
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
    <AnimatedTimer id={id} />
  </div>
);

const defaultToastLayout = (message: string, id: string) => (
  <div style={{ ...toastOptions.style }}>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h4
        style={{
          fontSize: "10px",
          fontWeight: "400",
          lineHeight: "12.6px",
          textAlign: "left",
        }}
      >
        {message}
      </h4>
    </div>
    <AnimatedTimer id={id} />
  </div>
);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
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
    },
    options?: ToastOptions,
  ) => {
    toast.promise(
      promise,
      {
        loading: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <h4
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                lineHeight: "16.38px",
                textAlign: "left",
              }}
            >
              {msgs.loading}
            </h4>
            {msgs.description && (
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: "normal",
                  lineHeight: "12.6px",
                  textAlign: "left",
                  color: "#999999",
                }}
              >
                {msgs.description}
              </p>
            )}
          </div>
        ),
        success: (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyItems: "space-between",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  lineHeight: "16.38px",
                  textAlign: "left",
                }}
              >
                {msgs.success}
              </h4>
              {msgs.description && (
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: "normal",
                    lineHeight: "12.6px",
                    textAlign: "left",
                    color: "#999999",
                  }}
                >
                  {msgs.description}
                </p>
              )}
            </div>
            <AnimatedTimer id="promise-toast" />
          </div>
        ),
        error: (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyItems: "space-between",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  lineHeight: "16.38px",
                  textAlign: "left",
                }}
              >
                {msgs.error}
              </h4>
              {msgs.description && (
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: "normal",
                    lineHeight: "12.6px",
                    textAlign: "left",
                    color: "#999999",
                  }}
                >
                  {msgs.error}
                </p>
              )}
            </div>
            <AnimatedTimer id="promise-toast" />
          </div>
        ),
      },
      { ...toastOptions, ...options },
    );
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
