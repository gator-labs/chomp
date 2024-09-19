import type { Metadata, Viewport } from "next";

type Props = {
    params: { burnTx: string }
  }
  
export async function generateMetadata(
    { params: {burnTx} }: Props,
  ): Promise<Metadata> {
    let images = ["/o1.png"]
    console.log("burnTx", burnTx)
   
   
    return {
      title: "OCHOMP " + burnTx || "",
      description:
        "ODESC",
      generator: "Next.js",
      manifest: "/manifest.json",
      icons: [
        { rel: "apple-touch-icon", url: "/icons/icon-128x128.png" },
        { rel: "icon", url: "/icons/icon-128x128.png" },
      ],
      openGraph: {
        images,
      },
    }
  }

export default function Page() {}
