"use client";

import { WalletOutlineIcon } from "@/app/components/Icons/WalletOutlineIcon";
import { SunsetBanner } from "@/components/SunsetBanner";
import ChompyHeart from "@/public/images/chompy_heart.png";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";

const SlideshowScreen = () => {
  return (
    <main className="h-dvh bg-gray-800">
      <SunsetBanner className="fixed" />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-4 h-full justify-between pb-6">
        <div className="h-[3em] min-h-[3em] sm:h-[9em] sm:min-h-[9em]"></div>
        <div className="flex flex-col gap-5 items-center">
          <Image
            src={ChompyHeart.src}
            width={200}
            height={175}
            alt="chomp"
            className="mb-8"
          />

          <h3 className="text-center text-3xl leading-6 font-black">
            CHOMPY IS MOVING!
          </h3>

          <div className="flex flex-col gap-4 items-center w-full justify-between">
            <p className="text-xl text-center flex flex-col gap-5">
              He has loved his home and the friends
              <br />
              he has made. He&apos;s packing his boxes
              <br />
              and venturing on a nomadic journey
              <br />
              until he figures out where to settle
              <br />
              down next.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-[14px] items-center w-full pt-4 px-12">
            <DynamicConnectButton
              buttonContainerClassName="w-full flex justify-center"
              buttonClassName="w-full max-w-[30rem] flex bg-purple-500 text-white items-center justify-center py-2 px-16 rounded-full text-lg font-bold"
            >
              <span className="flex items-center gap-2">
                <WalletOutlineIcon />
                Connect Wallet
              </span>
            </DynamicConnectButton>
          </div>

          <div className="text-sm font-weight-500 text-center">
            By connecting your wallet and using this platform, you are
            <br /> agreeing to our{" "}
            <a
              href="https://docs.chomp.games/legal/terms-of-service"
              className="underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="https://docs.chomp.games/legal/privacy-policy"
              className="underline"
            >
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
    </main>
  );
};

export default SlideshowScreen;
