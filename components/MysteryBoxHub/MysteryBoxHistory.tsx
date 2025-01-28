import { EMysteryBoxCategory } from "@/types/mysteryBox";

import MysteryBoxHistoryCard from "./MysteryBoxHistoryCard";

type MysteryBoxHistoryProps = {};

function MysteryBoxHistory({}: MysteryBoxHistoryProps) {
  const mysteryBoxes = [
    {
      credits: 400,
      bonk: 50000,
      openedAt: "2025-01-26T12:33:19Z",
      category: EMysteryBoxCategory.Streaks,
      id: 1,
    },
    {
      credits: 400,
      bonk: 50000,
      openedAt: "2025-01-26T12:33:19Z",
      category: EMysteryBoxCategory.Validation,
      id: 2,
    },
    {
      credits: 400,
      bonk: 50000,
      openedAt: "2025-01-26T12:33:19Z",
      category: EMysteryBoxCategory.Practice,
      id: 3,
    },
    {
      credits: 400,
      bonk: 50000,
      openedAt: "2025-01-26T12:33:19Z",
      category: EMysteryBoxCategory.Campaign,
      id: 4,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-3 bg-[#202020] opacity-50% rounded-lg m-2 p-2">
        <div>
          <h1 className="bg-blue-pink-gradient inline-block text-transparent bg-clip-text font-bold py-2 px-2 text-xl">
            History
          </h1>
        </div>

        {/*<h2 className="font-extrabold py-1 px-2">Sort by Date</h2>*/}

        {mysteryBoxes.map((box) => (
          <MysteryBoxHistoryCard box={box} key={box.id} />
        ))}

        <div className="flex justify-center text-gray-400 text-sm pt-2 mb-6">
          Load more
        </div>
      </div>
    </>
  );
}

export default MysteryBoxHistory;
