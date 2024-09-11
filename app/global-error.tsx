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
}: {
  error: Error & { digest?: string };
}) {
  const router = useRouter();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  console.log(error.message);

  return (
    <html>
      <body>
        <div className="flex flex-col font-sora bg-gray-950 text-white h-full w-[25%] mx-auto pt-14 gap-2">
          <div className="bg-gray-800 rounded-3xl relative">
            <Image
              src="/images/eroor-bg-attern.svg"
              alt="Background Cover"
              className="object-cover w-full h-full rounded-3xl"
              width={100}
              height={20}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-purple-200 text-[96px] font-bold">404</p>
            </div>
          </div>

          <div className="flex flex-col items-start text-white mt-2 gap-2">
            <p className="text-base mb-2">
              Page not found. Let&apos; s go somewhere else!
            </p>
            <p className="text-base mb-2">Optional error description</p>
            <p className="text-base">
              (stack trace, other technical info that may be helpful for
              debugging)
            </p>
          </div>

          <div className="flex flex-col mt-auto gap-4 mb-8">
            <Button
              size="lg"
              className="gap-1 w-full"
              onClick={() => {
                router.push("/application");
              }}
            >
              Refresh the page
              <RefreshIcon />
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
