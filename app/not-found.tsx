"use client";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import { Button } from "./components/ui/button";
import { House, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const router = useRouter();

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
          <p className="text-purple-200 text-[96px] font-bold">404</p>
        </div>
      </div>

      <div className="flex flex-col items-start text-white mt-2 gap-2">
        <p className="text-[16px] mb-2">
          Page not found. Let&apos; s go somewhere else!
        </p>
      </div>

      <div className="flex flex-col mt-auto gap-y-[16px] mb-[16px]">
        <Button
          size="lg"
          onClick={() => {
            router.push("/application");
          }}
          className="text-[14px] gap-2"
        >
          Return home
          <House />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            router.back();
          }}
          className="text-[14px] gap-2"
        >
          <ArrowLeft />
          Back to previous page
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
