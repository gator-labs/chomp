"use client";

import { FC, useMemo } from "react";
import { WalletProvider } from '@solana/wallet-adapter-react';
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";

import TiplinkConnect from "./tiplinkConnect";

const ConnectWithOtpView: FC = () => {

  // const [user, setUser] = useState(null);


  const wallets = useMemo(
    () => [
      new TipLinkWalletAdapter({
        title: "Chomp",
        clientId: "cf579504-6e22-4950-868a-9004cc3f489d",
        theme: "dark"
      }),
    ],
    []
  );



  // useEffect(() => {
  //   // Ensure Telegram Web App API is available
  //   const script = document.createElement('script');
  //   script.src = "https://telegram.org/js/telegram-web-app.js";
  //   script.async = true;
  //   document.body.appendChild(script);

  //   script.onload = () => {
  //     Telegram.WebApp.ready();

  //     // Retrieve user details
  //     const initDataUnsafe = Telegram.WebApp.initDataUnsafe;
  //     const user = initDataUnsafe.user;

  //     // Set user details in state
  //     if (user) {
  //       setUser(user);
  //     }
  //   };

  //   return () => {
  //     document.body.removeChild(script);
  //   };
  // }, []);

  return (
    <WalletProvider wallets={wallets} autoConnect >
      <div className="space-y-6 flex flex-col w-2/3 mt-12">
        <p className="text-2xl text-center">Good job chompins!</p>

        <TiplinkConnect />

        {/* <p>User ID: {user?.id}</p>
        <p>First Name: {user?.first_name}</p>
        <p>Last Name: {user?.last_name}</p>
        <p>Username: {user?.username}</p>
        <p>Language Code: {user?.language_code}</p> */}



      </div>
    </WalletProvider>
  );
};

export default ConnectWithOtpView;
