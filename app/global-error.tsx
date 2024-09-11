"use client";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import { useEffect } from "react";
import { BackIconOutline } from "./components/Icons/BackIconOutline";
import { RefreshIcon } from "./components/Icons/RefreshIcon";
import { Button } from "./components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // Check if it's a server-side error
  const isServerError = (error as any).digest !== undefined;

  // Set status code and error message
  const statusCode = isServerError ? 500 : 400;
  const errorMessages = isServerError
  ? ["Server error. Please refresh the page and try again.", "Please let us know on Telegram if this error happens again. 🙏"]
  : ["Client error. Please refresh the page and try again.", "Please let us know on Telegram if this error happens again. 🙏"];

  return (
    <html>
      <body className="bg-gray-950">
        <div className="flex flex-col font-sora  text-white h-full w-[25%] mx-auto pt-14 gap-2">
          <div className="bg-gray-800 rounded-3xl relative">
            <Image
              src="/images/eroor-bg-attern.svg"
              alt="Background Cover"
              className="object-cover w-full h-full rounded-3xl"
              width={100}
              height={20}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-purple-200 text-[96px] font-bold">{statusCode}</p>
            </div>
          </div>

          <div className="flex flex-col items-start text-white mt-2 gap-2">
          {errorMessages.map((message, index) => (
            <p 
              key={index} 
              className={`${
                index === 0 
                  ? "text-base font-bold text-[16px]" 
                  : "text-sm font-normal text-[14px]"
              } mb-2`}
            >
              {message}
            </p>
          ))}
        </div>

          <div className="flex flex-col mt-auto gap-4 mb-8">
            <Button size="lg" className="gap-1 w-full" onClick={() => reset()}>
              Refresh the page
              <RefreshIcon fill="none" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-1"
              onClick={() => {
                router.back();
              }}
            >
              <BackIconOutline fill="none" />
              Back to previous page
            </Button>
          </div>
        </div>
      </body>
      {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
      {/* <NextError statusCode={0} /> */}
    </html>
  );
}
