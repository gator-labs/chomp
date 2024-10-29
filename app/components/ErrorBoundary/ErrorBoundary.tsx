"use client";

import { HOME_PATH } from "@/lib/urls";
import * as Sentry from "@sentry/nextjs";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "../ui/button";

function ErrorBoundary({ error }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // Check if it's a server-side error
  const isServerError = (error as any).digest !== undefined;

  // Set status code and error message
  const statusCode = isServerError ? 500 : 400;
  const errorMessages = isServerError
    ? "Server error. Please refresh the page and try again."
    : "Client error. Please refresh the page and try again.";

  return (
    <div className="flex flex-col font-sora bg-gray-950 text-white h-full w-[90%] md:w-[50%] lg:w-[25%] mx-auto pt-14 gap-2">
      <div className="bg-gray-800 rounded-[16px] relative gap-24px">
        <Image
          src="/images/eroor-bg-attern.svg"
          alt="Background Cover"
          className="object-cover w-full h-full rounded-[16px]"
          width={100}
          height={20}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-purple-200 text-[96px] font-bold">{statusCode}</p>
        </div>
      </div>

      <div className="flex flex-col items-start text-white mt-2 gap-2">
        <p className="text-[16px] font-bold  mb-2">{errorMessages}</p>
        <p className="text-[14px] font-normal mb-2">
          Please let us know on{" "}
          <Link
            href="https://t.me/+8ffiqdoGLAIyZmNl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-200 hover:underline"
          >
            Telegram
          </Link>{" "}
          if this error happens again. 🙏
        </p>
      </div>

      <div className="flex flex-col mt-auto gap-y-[16px] mb-[16px]">
        <Button
          variant="outline"
          className="text-[14px] gap-2"
          onClick={() => (window.location.href = HOME_PATH)}
        >
          <ArrowLeft />
          Return home
        </Button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
