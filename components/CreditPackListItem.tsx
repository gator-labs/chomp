import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

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
          <span
            className={cn("line-through", {
              "text-gray-400": !isSelected,
              "text-gray-200": isSelected,
            })}
          >
            {originalCostPerCredit} SOL
          </span>
        )}
        <span> {costPerCredit} SOL</span>
        <span
          className={cn("text-xs", {
            "text-gray-400": !isSelected,
            "text-gray-200": isSelected,
          })}
        >
          per credit
        </span>
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
