import { HalfArrowLeftIcon } from "@/app/components/Icons/HalfArrowLeftIcon";
import { Navbar } from "@/app/components/Navbar/Navbar";
import { getDeckDetails } from "@/app/queries/deck";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import dynamic from "next/dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
const DeckDetails = dynamic(
  () => import("@/app/components/DeckDetails/DeckDetails"),
  { ssr: false },
);

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
