import { GoogleViaTipLinkWalletName } from '@tiplink/wallet-adapter'
import { useWallet } from '@solana/wallet-adapter-react'
import { CONNECTION, genBonkBurnTx } from '../utils/solana';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { ISolana } from '@dynamic-labs/solana';

// assuming the ExampleComponent is a descendant of the 
// WalletProvider somewhere
function TiplinkConnect() {
    const { select, connect, publicKey, sendTransaction } = useWallet();


    console.log(publicKey)

    // call this function upon button click
    const connectTiplink = async function loginViaTipLink() {
        select(GoogleViaTipLinkWalletName)

        // if autoconnect is not set to true on the WalletProvider, 
        // include this line below
        await connect();
    }

    const onBurn = async () => {
        console.log("burning");

        const lamports = await CONNECTION.getMinimumBalanceForRentExemption(0);
        console.log(lamports)

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: Keypair.generate().publicKey,
                lamports,
            })
        );

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await CONNECTION.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, CONNECTION, { minContextSlot });
        // // const signer = await primaryWallet!.connector.getSigner<ISolana>();
        // const tx = await genBonkBurnTx(
        //     primaryWallet!.address,
        //     blockhash.blockhash,
        //     1,
        // );
        // const signer = await primaryWallet!.connector.getSigner<ISolana>();
        // const tx = await genBonkBurnTx(
        //     primaryWallet!.address,
        //     blockhash.blockhash,
        //     1,
        // );
        // const signature = await (
        //   primaryWallet!.connector as any
        // ).signAndSendTransaction(tx);
        // // const { signature } =
        // //   await primaryWallet!.connector.signAndSendTransaction(tx);
        await CONNECTION.confirmTransaction({
            blockhash: blockhash?.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
            signature,
        });
    };

    return (
        <div>
            <button
                className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2"
                onClick={connectTiplink}
            >
                Connect
            </button>
            <button
                className="w-full rounded-sm bg-[#A3A3EC] text-xl p-2"
                onClick={onBurn}
            >
                Burn
            </button>
            <div />
        </div>
    )

}

export default TiplinkConnect