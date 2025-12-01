"use client";

import { WalletOutlineIcon } from "@/app/components/Icons/WalletOutlineIcon";
import { SunsetBanner } from "@/components/SunsetBanner";
import ChompyHeart from "@/public/images/chompy_heart.png";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";

const SlideshowScreen = () => {
  return (
    <main className="h-dvh bg-gray-800 flex flex-col">
      <SunsetBanner className="sticky" />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-4 h-full justify-between pb-6">
        <div></div>

        <div className="flex flex-col gap-5 items-center">
          <Image
            src={ChompyHeart.src}
            width={200}
            height={175}
            alt="chomp"
            className="mb-8"
          />

          <h3 className="text-center text-2xl leading-6 font-black">
            CHOMPY IS MOVING!
          </h3>

          <div className="flex flex-col gap-4 items-center justify-between max-w-xs">
            <p className="text-[12px]/[1.2] text-center flex flex-col gap-5 font-medium">
              He&apos;s loved his time with all of you, but it&apos;s time to
              move out of his first home. CHOMP sunsets Dec 19. See the full
              plan + farewell gift inside.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-[14px] items-center w-full pt-4 px-12">
            <DynamicConnectButton
              buttonContainerClassName="w-full flex justify-center"
              buttonClassName="w-full max-w-[30rem] flex bg-purple-500 text-white items-center justify-center py-2 px-16 rounded-full text-xs font-bold"
            >
              <span className="flex items-center gap-2">
                <WalletOutlineIcon />
                Connect Wallet
              </span>
            </DynamicConnectButton>
          </div>

          <div className="text-xs font-medium text-center">
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
