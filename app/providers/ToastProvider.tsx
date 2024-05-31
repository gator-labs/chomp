"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import ProgressCloseButton from "../components/ProgressCloseButton/ProgressCloseButton";

interface ToastProviderProps {
  children: React.ReactNode;
}

const contextClass = {
  success: "",
  error: "",
  info: "bg-[#1B1B1B] border-[1px] border-solid !border-purple",
  warning: "",
  default: "",
  dark: "",
};

export default function ToastProvider({ children }: ToastProviderProps) {
  const autoCloseDuration = 3000;

  return (
    <>
      {children}
      <ToastContainer
        toastClassName={(context) =>
          contextClass[context?.type || "default"] +
          " relative flex py-3 px-6 first:mt-[46px] mt-2 rounded-md justify-between overflow-hidden cursor-pointer mx-4 h-[50px] rounded-[8px] items-center"
        }
        bodyClassName={() => "text-xs flex items-center justify-start"}
        position="top-center"
        autoClose={autoCloseDuration}
        hideProgressBar
        closeButton={({ closeToast }) => (
          <ProgressCloseButton
            onClick={closeToast}
            progressDuration={autoCloseDuration}
          />
        )}
        icon={false}
      />
    </>
  );
}
