import type { Metadata, Viewport, ResolvingMetadata } from "next";

type Props = {
    searchParams: {     
      questionId: string;
      userId: string;
      burnTxId: string; 
    }
  }

export async function generateMetadata(
    {searchParams }: Props,
    parent: ResolvingMetadata
  ): Promise<Metadata> {
    const { burnTxId } = searchParams;
    let images = burnTxId ? ["/o2.png"] : ["/o1.png"]
   
   
    return {
      title: "MCHOMP",
      description:
        "MDESC",
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

  export default function Page({ searchParams }: Props) {}
