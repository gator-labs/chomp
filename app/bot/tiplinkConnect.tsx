import { GoogleViaTipLinkWalletName } from '@tiplink/wallet-adapter'
import { useWallet } from '@solana/wallet-adapter-react'
import { CONNECTION, genBonkBurnTx, getBonkBalance } from '../utils/solana';

import { useState } from 'react';
import { CopyIcon } from '@dynamic-labs/sdk-react-core';
import { Button } from '../components/Button/Button';

import { copyTextToClipboard } from "../utils/clipboard";
import { useToast } from "../providers/ToastProvider";
import { formatAddress } from '../utils/wallet';



function TiplinkConnect() {

    const { select, connect, publicKey, sendTransaction, wallet } = useWallet();

    const { successToast, errorToast } = useToast();
    /*
        // @ts-ignore */
    const address = wallet?.adapter?._wallet?.publicKeyString;

    const [burned, setBurned] = useState(false);

    const connectTiplink = async function loginViaTipLink() {
        try {
            select(GoogleViaTipLinkWalletName)
            await connect();
        }
        catch (error) {
            console.log(error)
            errorToast("connection failed");
        }
    }

    const onBurn = async () => {

        try {
            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await CONNECTION.getLatestBlockhashAndContext();


            if (!publicKey) {
                console.error("Public key is null. Please connect your wallet.");
                return;
            }

            const tx = await genBonkBurnTx(
                publicKey.toString(),
                blockhash,
                10
            );
            const signature = await sendTransaction(tx, CONNECTION, { minContextSlot });

            await CONNECTION.confirmTransaction({
                blockhash: blockhash,
                lastValidBlockHeight: lastValidBlockHeight,
                signature,
            });

            setBurned(true)
        }
        catch (error) {
            console.log(error)
            errorToast("Error in Bunrn transaction");
        }
    };

    const handleCopyToClipboard = async () => {
        await copyTextToClipboard(address);
        successToast(
            "Copied to clipboard",
            `Copied ${formatAddress(address)} to clipboard`,
        );
    };


    return (
        <div>
            {burned ?
                <p className="text-2xl text-[#A3A3EC] text-center">
                    BONK burn and reveal successful! Return to Telegram.
                </p> :
                <p className='pb-2 text-center'>
                    You have 8 questions to reveal. You must reveal in order to see the
                    answer and find out if you won anything.
                </p>
            }
            {
                publicKey === null ?
                    <button
                        className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2 mb-10"
                        onClick={connectTiplink}
                    >
                        Connect
                    </button>
                    :
                    !burned ?
                        <>

                            {address !== '' &&
                                <div className="text-center flex flex-col ml">
                                    Your address:
                                    <p className="whitespace-nowrap overflow-hidden text-ellipsis text-center ">
                                        {address}
                                    </p>

                                    <span>
                                        <Button
                                            isPill
                                            className="!p-0 !w-[28px] !h-[28px] bg-[#A3A3EC] border-none ml-2"
                                            onClick={handleCopyToClipboard}
                                        >
                                            <CopyIcon />
                                        </Button>
                                    </span>
                                </div>}

                            <button
                                className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2 mt-2"
                                onClick={onBurn}
                            >
                                Burn
                            </button> </> : ''}
        </div>
    )

}

export default TiplinkConnect