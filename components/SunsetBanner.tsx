import Link from "next/link";

export function SunsetBanner() {
  return (
    <div className="bg-[#ED6A5A] p-5 fixed">
      <div className="font-bold font-black text-lg">CHOMPY IS MOVING</div>
      <div className="text-sm">
        This version of CHOMP will go offline on December 19th 11:59pm UTC.
        Be in Top 100 All Time Points <Link href="/Leaderboard" className="underline">Leaderboard</Link> by December 14th
        11:59pm to claim a gift from Chompy! Read more about it <Link href="/" className="underline">here</Link>.
      </div>
    </div>
  );
}
