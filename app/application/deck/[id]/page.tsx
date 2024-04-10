import Link from "next/link";
import dynamic from "next/dynamic";
const DeckDetails = dynamic(
  () => import("@/app/components/DeckDetails/DeckDetails"),
  { ssr: false }
);
import { getDeckDetails } from "@/app/queries/deck";
import { redirect } from "next/navigation";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { Navbar } from "@/app/components/Navbar/Navbar";
import { Suspense } from "react";
import { HalfArrowLeftIcon } from "@/app/components/Icons/HalfArrowLeftIcon";

type PageProps = {
  params: { id: string };
  searchParams: { returnUrl?: string };
};

export default async function Page({
  params: { id },
  searchParams: { returnUrl },
}: PageProps) {
  const deck = await getDeckDetails(+id);

  if (!deck) {
    return redirect(returnUrl ?? "/application");
  }

  return (
    <div className="h-full p-2">
      <Navbar
        avatarSrc={AvatarPlaceholder.src}
        avatarLink="/application/profile"
        walletLink=""
      >
        <Suspense>
          <Link href={returnUrl ?? "/application"}>
            <div className="flex items-center text-xs">
              <HalfArrowLeftIcon />
              <div className="text-aqua">Chomped</div>
            </div>
          </Link>
        </Suspense>
      </Navbar>
      <Suspense>
        <DeckDetails deck={deck} />
      </Suspense>
    </div>
  );
}
