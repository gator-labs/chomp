import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { getTimeString } from "@/app/utils/dateUtils";
import { addSpaceBetweenCapitalLetters } from "@/app/utils/string";
import { TransactionLogType } from "@prisma/client";

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
    <div className="font-sora text-sm text-white my-4">
      <div className="flex justify-between gap-x-2 mb-4">
        <div>
          {numberToCurrencyFormatter.format(amount)} {amountLabel}
        </div>
        <div>{addSpaceBetweenCapitalLetters(transactionType)}</div>
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
