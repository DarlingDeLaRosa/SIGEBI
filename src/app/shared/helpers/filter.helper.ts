export function filterByProperty<T>(
  items: T[],
  search: string,
  property: keyof T
): T[] {

  if (!search?.trim()) {
    return items;
  }

  const term = search.toLowerCase();

  return items.filter(item =>
    String(item[property])
      .toLowerCase()
      .includes(term)
  );
}