import { Turnkey } from "@turnkey/sdk-server";

const turnkey = new Turnkey({
  apiBaseUrl: "https://api.turnkey.com",
  defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  apiPrivateKey: process.env.TURNKEY_API_KEY_PRIVATE!,
  apiPublicKey: process.env.NEXT_PUBLIC_TURNKEY_API_KEY_PUBLIC!,
});

const endpoint = turnkey.nextProxyHandler({
  allowedMethods: [
    "createSubOrganization",
    "emailAuth",
    "initUserEmailRecovery",
    "getSubOrgIds",
  ],
});

export default endpoint;
