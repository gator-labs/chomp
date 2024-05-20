export const numberToCurrencyFormatter = new Intl.NumberFormat();

export const formatNumber = (
  number: number,
  minDigits?: number,
  maxDigits?: number,
) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: minDigits || 2,
    maximumFractionDigits: maxDigits || 2,
  }).format(Number(number));
};
