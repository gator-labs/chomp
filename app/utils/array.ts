export function onlyUnique<T>(value: T, index: number, array: Array<T>) {
  return array.indexOf(value) === index;
}

export function getAverage(numbers: number[]): number {
  return (
    numbers.reduce((sum, currentValue) => {
      return sum + currentValue;
    }, 0) / numbers.length
  );
}
