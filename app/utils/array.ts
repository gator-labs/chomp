export function onlyUnique<T>(value: T, index: number, array: Array<T>) {
  return array.indexOf(value) === index;
}
