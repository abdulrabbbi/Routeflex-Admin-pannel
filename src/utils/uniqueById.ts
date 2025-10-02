export function uniqueById<T extends { _id: string | number }>(arr: T[]): T[] {
  const map = new Map<string | number, T>();
  for (const item of arr) map.set(item._id, item);
  return Array.from(map.values());
}