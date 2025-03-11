import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import Decimal from "decimal.js";

type CreditPackListItemProps = {
  amount: number;
  costPerCredit: string;
  originalCostPerCredit: string;
  onToggle: (isSelected: boolean) => void;
  isSelected: boolean;
};

function CreditPackListItem({
  amount,
  costPerCredit,
  originalCostPerCredit,
  onToggle,
  isSelected,
}: CreditPackListItemProps) {
  const handleSelect = () => {
    if (onToggle) {
      onToggle(!isSelected);
    }
  };

  const originalTotal = new Decimal(originalCostPerCredit)
    .mul(amount)
    .toString();
  const newTotal = new Decimal(costPerCredit).mul(amount).toString();

  return (
    <li
      className={cn(
        "border-2 rounded-md border-dashed flex border-gray-500 p-2 items-center justify-between",
        { "bg-purple-300": isSelected, "bg-gray-600": !isSelected },
      )}
    >
      {isSelected ? (
        <div className="text-white font-black py-2 px-2 text-xl">
          {amount} Credits
        </div>
      ) : (
        <div className="bg-blue-pink-gradient inline-block text-transparent bg-clip-text font-black py-2 px-2 text-xl text-black">
          {amount} Credits
        </div>
      )}

      <div className="flex flex-col text-sm font-bold">
        {costPerCredit != originalCostPerCredit && (
          <span className="text-gray-400 line-through">
            {originalTotal} SOL
          </span>
        )}
        <span> {newTotal} SOL</span>
      </div>

      <div>
        <Button onClick={handleSelect} className="px-3">
          {isSelected ? "Unselect" : "Select"}
        </Button>
      </div>
    </li>
  );
}

export default CreditPackListItem;
