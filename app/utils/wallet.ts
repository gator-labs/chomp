import { DynamicJwtPayload } from "@chomp/lib/auth";

export function formatAddress(address: string) {
  if (address.length <= 8) {
    return address;
  }

  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
}

export function getAddressFromVerifiedCredentials(
  payload: DynamicJwtPayload | null,
) {
  if (!payload) {
    return "";
  }

  const verifiedCredentials = payload?.verified_credentials.find(
    (vc) => vc.format === "blockchain",
  ) ?? { address: "" };

  if ("address" in verifiedCredentials) {
    return verifiedCredentials.address;
  }

  return "";
}
