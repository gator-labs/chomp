export function getAppendedNewSearchParams(newQuery: Record<string, string>) {
  const searchParams = new URLSearchParams(window.location.search);
  Object.keys(newQuery).forEach((key) => {
    if (newQuery[key].trim() !== "") {
      searchParams.set(key, newQuery[key]);
    } else {
      searchParams.delete(key);
    }
  });
  const newParams = searchParams ? `?${searchParams}` : "";

  return newParams;
}
