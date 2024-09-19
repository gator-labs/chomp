import { getOgShareClaimAllPath } from "@/lib/urls";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
    params: { burnTx: string }
  }
  
export async function generateMetadata(
    { params: {burnTx} }: Props,
  ): Promise<Metadata> {
    let images = [getOgShareClaimAllPath(burnTx)]
   
    return {
      openGraph: {
        images,
      },
    }
  }

export default function Page() {
  redirect('/login')
}