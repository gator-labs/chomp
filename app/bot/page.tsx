"use client";

import { DEFAULT_SOLANA_ACCOUNTS } from "@turnkey/sdk-browser";
import { useTurnkey } from "@turnkey/sdk-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState("");
  const { turnkey, authIframeClient } = useTurnkey();

  const loginWithIframe = async (credentialBundle: string) => {
    console.log("loginWithIFrame");
    console.log(authIframeClient);
    await authIframeClient?.injectCredentialBundle(credentialBundle);
    console.log("Credentials injected");
    await authIframeClient?.login();
    console.log("loginWithIFrame finished");
  };

  const initEmailAuth = async (subOrgId: string) => {
    return await turnkey?.serverSign("emailAuth", [
      {
        email: userEmail,
        targetPublicKey: `${authIframeClient!.iframePublicKey}`,
        organizationId: subOrgId,
      },
    ]);
  };

  const submitCreateWallet = async (e: any) => {
    e.preventDefault();
    console.log("Creating wallet for", userEmail);
    const subOrganizationConfig = {
      subOrganizationName: userEmail,
      rootUsers: [
        {
          userName: userEmail,
          userEmail,
          apiKeys: [],
          authenticators: [],
        },
      ],
      rootQuorumThreshold: 1,
      wallet: {
        walletName: "ChompBot",
        accounts: DEFAULT_SOLANA_ACCOUNTS,
      },
    };

    const subOrg = (await turnkey!.serverSign("createSubOrganization", [
      subOrganizationConfig,
    ])) as any;
    console.log("Suborg created", subOrg);
    // await createWallet(userEmail);
    // async void, just sends email
    const credentialBundle = (await initEmailAuth(
      subOrg.subOrganizationId,
    )) as any;
    console.log("Credential bundle", credentialBundle);

    await loginWithIframe(credentialBundle);
    console.log("Wallet created for", userEmail);
  };

  return (
    <main className="flex flex-col justify-center items-center gap-3 h-full p-4">
      <p className="text-[13px] mb-2">Create account</p>
      <form
        onSubmit={submitCreateWallet}
        className="flex flex-col gap-3 items-center w-full max-w-xs"
      >
        <input
          type="email"
          placeholder="Enter your email"
          className="border rounded p-2 w-full text-black"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded p-2 w-full"
        >
          Create Account
        </button>
      </form>

      <div id="turnkey-default-iframe-container-id"></div>
    </main>
  );
}
