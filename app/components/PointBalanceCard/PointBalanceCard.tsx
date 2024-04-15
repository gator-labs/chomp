import classNames from "classnames";
import c from "./PointBalanceCard.module.css";

type PointBalanceCardProps = {
  amount: number;
};

export default function PointBalanceCard({ amount }: PointBalanceCardProps) {
  return (
    <div
      className={classNames(
        "flex justify-between items-center rounded-full px-6 py-4 bg-[#333]",
        c.card,
      )}
    >
      <span className="text-s leading-4">Chomp Points</span>

      <span className="text-s leading-4">
        <span className="font-bold">{amount}</span> Pts
      </span>
    </div>
  );
}
