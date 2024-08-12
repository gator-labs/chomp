import { copyTextToClipboard } from '@/app/utils/clipboard';

import React from 'react'
import Image from 'next/image';
import { useToast } from '@/app/providers/ToastProvider';
import { CopyIcon } from '../../Icons/CopyIcon';
import { HalfArrowRightIcon } from "../../Icons/HalfArrowRightIcon"


type Props = {
    wallet: string;
    handleSetupComplete: () => void;
}

function NewUserScreen({ wallet, handleSetupComplete }: Props) {
    const { successToast } = useToast();
    return (
        <div className="space-y-6 flex flex-col w-3/3 p-4 items-center justify-center">
            <Image
                src="/images/chomp-asset.png"
                width={400}
                height={400}
                alt="Chomp Cover"
                className="mt-5"
            />
            <p className="text-[1.6rem] font-bold text-center">
                Wallet Created
            </p>
            <p className="flex flex-col space-y-4 text-left">
                <span className="block">
                    Congratulations on creating your Chomp wallet!
                </span>
                <span className="block">
                    Now proceed with playing, load up some <strong className="font-bold">SOL</strong> or <strong className="font-bold">BONK</strong> in your wallet first.
                </span>
                <span className="block">
                    Once you&apos;re done, come back again and start Chomping!
                </span>
            </p>
            <button
                onClick={() => {
                    copyTextToClipboard(wallet);
                    successToast("Address copied successfully!");
                }}
                className={`flex flex-row justify-center w-full py-2 px-5 rounded-sm bg-purple text-[#0D0D0D]`}
            >
                Copy Wallet Address
                <CopyIcon fill="#0D0D0D" />
            </button>
            <button
                onClick={() => {
                    handleSetupComplete()
                }}
                className={`flex flex-row justify-center w-full py-2 px-5 rounded-sm bg-purple text-[#0D0D0D]`}
            >
                Next
                <HalfArrowRightIcon fill="#0D0D0D" />
            </button>
        </div>
    )
}

export default NewUserScreen