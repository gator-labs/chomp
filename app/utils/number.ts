export const nthNumber = (number: number) => {
  if (number > 3 && number < 21) return "th";
  switch (number % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

// Handle big values
export const formatNumber = (number: number) => {
  if (number > 9999) {
    return `${number / 1000}K`;
  } else if (number > 999999) {
    return `${number / 1000000}M`;
  } else if (number > 999999999) {
    return `${number / 1000000000}B`;
  }
  return number;
};

export function formatCompactAmount(amount: number | string, maxDecimals = 4) {
  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: maxDecimals,
    roundingMode: "trunc",
  });
  return formatter.format(Number(amount));
}
