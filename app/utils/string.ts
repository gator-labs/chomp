export function addSpaceBetweenPattern(value: string, pattern: RegExp) {
  return value.split(pattern).reduce((acc, curr) => {
    if (acc === "") {
      return curr;
    }

    return acc + " " + curr;
  }, "");
}

export function addSpaceBetweenCapitalLetters(value: string) {
  return addSpaceBetweenPattern(value, /(?=[A-Z])/);
}
