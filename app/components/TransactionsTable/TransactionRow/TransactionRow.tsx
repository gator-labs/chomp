import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { getTimeString } from "@/app/utils/dateUtils";
import { TransactionLogType } from "@prisma/client";
import { TRANSACTION_LABEL } from "./constants";

export type TransactionData = {
  amount: number;
  amountLabel: string;
  dollarAmount?: number;
  transactionType: TransactionLogType;
  date: Date;
};

type TransactionRowProps = TransactionData;

export function TransactionRow({
  amount,
  amountLabel,
  dollarAmount,
  date,
  transactionType,
}: TransactionRowProps) {
  return (
    <div className="font-sora text-sm text-grey-0 my-4">
      <div className="flex justify-between gap-x-2 mb-4">
        <div>
          {numberToCurrencyFormatter.format(amount)} {amountLabel}
        </div>
        <div>
          {TRANSACTION_LABEL[transactionType as keyof typeof TRANSACTION_LABEL]}
        </div>
      </div>
      <div className="flex justify-between gap-x-2">
        <div>
          {dollarAmount && (
            <>~${numberToCurrencyFormatter.format(dollarAmount)}</>
          )}
        </div>
        <div>{getTimeString(date)}</div>
      </div>
    </div>
  );
}
