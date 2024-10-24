import { getOgShareClaimAllPath } from "@/lib/urls";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  params: { txHash: string };
};

export async function generateMetadata({
  params: { txHash },
}: Props): Promise<Metadata> {
  let images = [getOgShareClaimAllPath(txHash)];

  return {
    openGraph: {
      images,
    },
  };
}

export default async function Page() {
  redirect(
    `/application?utm_source=x&utm_medium=social&utm_campaign=app_share&utm_content=claim_all`,
  );
}
