import { GoogleViaTipLinkWalletName } from '@tiplink/wallet-adapter'
import { useWallet } from '@solana/wallet-adapter-react'
import { CONNECTION, genBonkBurnTx, getBonkBalance } from '../utils/solana';

import { PublicKey } from "@solana/web3.js";
import { useState } from 'react';


function TiplinkConnect() {

    const { select, connect, publicKey, sendTransaction } = useWallet();

    const [burned, setBurned] = useState(false);

    const connectTiplink = async function loginViaTipLink() {
        try {

            select(GoogleViaTipLinkWalletName)
            await connect();
        }
        catch (error) {
            console.log(error)
        }
    }

    const onBurn = async () => {

        try {
            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await CONNECTION.getLatestBlockhashAndContext();


            if (!publicKey) {
                // Handle the case where publicKey is null
                console.error("Public key is null. Please connect your wallet.");
                return;
            }

            // console.log(blockhash)
            const tx = await genBonkBurnTx(
                publicKey.toString(),
                blockhash,
                10
            );
            const signature = await sendTransaction(tx, CONNECTION, { minContextSlot });

            const res = await CONNECTION.confirmTransaction({
                blockhash: blockhash,
                lastValidBlockHeight: lastValidBlockHeight,
                signature,
            });

            setBurned(true)
        }
        catch (error) {
            console.log(error)
        }
    };
    return (
        <div>
            {burned ?
                <p className="text-2xl text-[#A3A3EC]">
                    BONK burn and reveal successful! Return to Telegram.
                </p> :
                <p className='pb-2'>
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
                        <button
                            className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2"
                            onClick={onBurn}
                        >
                            Burn
                        </button> : ''}
        </div>
    )

}

export default TiplinkConnect