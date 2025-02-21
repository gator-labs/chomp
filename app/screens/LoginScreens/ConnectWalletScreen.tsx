"use client";

import { ConcentricCirclesIcon } from "@/app/components/Icons/ConcentricCirclesIcon";
import { WalletOutlineIcon } from "@/app/components/Icons/WalletOutlineIcon";
import MysteryBox from "@/public/images/mysterybox.png";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";

const SlideshowScreen = () => {
  return (
    <main className="h-dvh bg-gray-800">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 px-4 h-full">
        <div className="relative w-full flex mt-4 mb-4 items-center justify-center">
          <ConcentricCirclesIcon className="absolute mx-auto my-auto" />
          <Image
            src={MysteryBox.src}
            width={134}
            height={109}
            alt="chomp"
            className="absolute"
          />
        </div>
        <div className="flex flex-col gap-4 items-center ">
          <h3 className="text-center text-xl leading-6 font-black">
            Believe in something? CHOMP it
          </h3>

          <div className="flex flex-col gap-4 items-center w-full justify-between">
            <p className="text-sm text-center flex flex-col gap-5">
              Opinions are like assholes, we&apos;re sure you&apos;ve
              <br />
              got one. Express your opinions on CHOMP,
              <br />
              and get rewarded for being right.
            </p>

            <p className="text-sm text-center flex flex-col gap-5">
              Compatible with all major Solana wallets -<br />
              connect, CHOMP, and earn. 🐊
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-[14px] items-center w-full pt-4">
          <DynamicConnectButton
            buttonContainerClassName="w-full flex justify-center"
            buttonClassName="w-full max-w-[30rem] flex bg-purple-500 text-white items-center justify-center py-3 px-16 rounded-lg text-sm font-semibold"
          >
            <span className="flex items-center gap-1">
              Connect Wallet
              <WalletOutlineIcon />
            </span>
          </DynamicConnectButton>
        </div>

        <div className="text-xs font-weight-500 text-center">
          By using connecting your wallet and using this platform, you are
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
    </main>
  );
};

export default SlideshowScreen;
