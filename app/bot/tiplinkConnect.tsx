import { GoogleViaTipLinkWalletName } from '@tiplink/wallet-adapter'
import { useWallet } from '@solana/wallet-adapter-react'
import { CONNECTION, genBonkBurnTx, getBonkBalance } from '../utils/solana';
import { publicKey } from '@metaplex-foundation/umi';
import { useState } from 'react';
import { burn } from '@solana/spl-token';

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

            const tx = await genBonkBurnTx(
                publicKey,
                blockhash?.blockhash,
                10
            );
            const signature = await sendTransaction(tx, CONNECTION, { minContextSlot });

            const res = await CONNECTION.confirmTransaction({
                blockhash: blockhash,
                lastValidBlockHeight: lastValidBlockHeight,
                signature,
            });
            console.log(res)
            setBurned(true)
        }
        catch (error) {
            console.log(error)
        }
    };
    console.log(publicKey)
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