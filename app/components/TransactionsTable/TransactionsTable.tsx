import classNames from "classnames";

import {
  TransactionData,
  TransactionRow,
} from "./TransactionRow/TransactionRow";

type TransactionsTableProps = {
  transactions: TransactionData[];
  className?: string;
};

export function TransactionsTable({
  transactions,
  className,
}: TransactionsTableProps) {
  return (
    <div className={classNames("overflow-y-auto no-scrollbar", className)}>
      {transactions.map((t, index) => (
        <div key={index}>
          <TransactionRow {...t} />
          {index !== transactions.length - 1 && (
            <div className="bg-gray-500 h-[1px] w-full"></div>
          )}
        </div>
      ))}
    </div>
  );
}
