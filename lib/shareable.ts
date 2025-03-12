let obj: { [key: string]: any } = {};

export function resetShared() {
  obj = {};
}

export function getShared() {
  return obj;
}
