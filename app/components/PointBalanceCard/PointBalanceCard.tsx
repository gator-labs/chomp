import { numberToCurrencyFormatter } from "@/app/utils/currency";

type PointBalanceCardProps = {
  amount: number;
};

export default function PointBalanceCard({ amount }: PointBalanceCardProps) {
  return (
    <div className="flex justify-between items-center rounded-full px-6 py-4 bg-gray-800 text-white">
      <span className="text-sm leading-4">Chomp Points</span>

      <span className="text-sm leading-4">
        <span className="font-bold">
          {numberToCurrencyFormatter.format(amount)}
        </span>{" "}
        Pts
      </span>
    </div>
  );
}
