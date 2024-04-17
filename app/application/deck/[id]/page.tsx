import { HalfArrowLeftIcon } from "@/app/components/Icons/HalfArrowLeftIcon";
import { Navbar } from "@/app/components/Navbar/Navbar";
import { getDeckDetails } from "@/app/queries/deck";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import dynamic from "next/dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
const DeckDetails = dynamic(
  () => import("@/app/components/DeckDetails/DeckDetails"),
  { ssr: false },
);

type PageProps = {
  params: { id: string };
  searchParams: { returnUrl?: string; openIds: string[] };
};

export default async function Page({
  params: { id },
  searchParams: { returnUrl, openIds },
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
        <Link href={returnUrl ?? "/application"}>
          <div className="flex items-center text-xs">
            <HalfArrowLeftIcon />
            <div className="text-aqua">Chomped</div>
          </div>
        </Link>
      </Navbar>
      <DeckDetails deck={deck} openIds={openIds} />
    </div>
  );
}
