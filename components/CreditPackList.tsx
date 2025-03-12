import { CreditPack } from "@prisma/client";

import CreditPackListItem from "./CreditPackListItem";

type CreditPackListProps = {
  packs: CreditPack[];
  onSelect: (packId: string | null) => void;
  selected: string | null;
};

function CreditPackList({ packs, onSelect, selected }: CreditPackListProps) {
  const handleToggle = (packId: string) => {
    if (selected === packId) {
      if (onSelect) onSelect(null);
    } else {
      if (onSelect) onSelect(packId);
    }
  };

  return (
    <>
      <div className="text-sm font-bold">Limited Time Offer!</div>
      <ul className="flex flex-col gap-2">
        {packs.map((pack) => (
          <CreditPackListItem
            amount={pack.amount}
            costPerCredit={pack.costPerCredit}
            originalCostPerCredit={pack.originalCostPerCredit}
            onToggle={() => handleToggle(pack.id)}
            key={pack.id}
            isSelected={selected == pack.id}
          />
        ))}
      </ul>
    </>
  );
}

export default CreditPackList;
