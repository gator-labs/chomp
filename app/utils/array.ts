export function onlyUnique<T>(value: T, index: number, array: Array<T>) {
  return array.indexOf(value) === index;
}

export function onlyUniqueBy<T, U>(selector: (value: T) => U) {
  return (value: T, index: number, array: Array<T>) => {
    return (
      array.findIndex((item) => selector(item) === selector(value)) === index
    );
  };
}

export function getAverage(numbers: number[]): number {
  return (
    numbers.reduce((sum, currentValue) => {
      return sum + currentValue;
    }, 0) / numbers.length
  );
}
