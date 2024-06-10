"use client";

import {
  useConnectWithOtp,
  useDynamicContext,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { Connection } from "@solana/web3.js";

import { FC, FormEventHandler } from "react";
import { genBonkBurnTx } from "../utils/solana";
const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

const ConnectWithOtpView: FC = () => {
  const { user } = useDynamicContext();
  // const { primaryWallet } = useDynamicContext();
  const userWallets = useUserWallets();
  console.log(user);
  console.log("userWallets");
  console.log(userWallets);
  const primaryWallet = userWallets.length > 0 ? userWallets[0] : null;

  const { verifyOneTimePassword, connectWithEmail } = useConnectWithOtp();

  const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    await connectWithEmail(event.currentTarget.email.value);
  };

  const onSubmitOtpHandler: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    const otp = event.currentTarget.otp.value;

    await verifyOneTimePassword(otp);
  };

  const onBurn = async () => {
    console.log("burning");
    const blockhash = await CONNECTION.getLatestBlockhash();
    // const signer = await primaryWallet!.connector.getSigner<ISolana>();
    const tx = await genBonkBurnTx(
      primaryWallet!.address,
      blockhash.blockhash,
      1,
    );
    const signature = await (
      primaryWallet!.connector as any
    ).signAndSendTransaction(tx);
    // const { signature } =
    //   await primaryWallet!.connector.signAndSendTransaction(tx);
    await CONNECTION.confirmTransaction({
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
      signature,
    });
  };

  return (
    <div className="text-black">
      <form key="sms-form" onSubmit={onSubmitEmailHandler}>
        <label htmlFor="email">Email:</label>
        <input type="text" name="email" placeholder="john@example.com" />

        <button type="submit">Submit</button>
      </form>

      <form key="otp-form" onSubmit={onSubmitOtpHandler}>
        <input type="text" name="otp" placeholder="OTP" />
        <button type="submit">Submit</button>
      </form>

      {!!primaryWallet && <button onClick={onBurn}>Burn Bonk</button>}

      {/* {!!user && (
        <>
          <p>Authenticated user:</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      )} */}
    </div>
  );
};

export default ConnectWithOtpView;
