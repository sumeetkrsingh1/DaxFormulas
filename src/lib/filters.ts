import type { Formula } from "./types";
import { F } from "./formulas";

export function getFiltered(
  activeCat: string,
  activeSub: string,
  searchQ: string,
): Formula[] {
  let list: Formula[] = [...(F as unknown as Formula[])];
  if (activeCat !== "all") list = list.filter((f) => f.cat === activeCat);
  if (activeSub !== "all") list = list.filter((f) => f.sub === activeSub);
  if (searchQ) {
    const q = searchQ.toLowerCase();
    list = list.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.q.toLowerCase().includes(q) ||
        f.dax.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q)) ||
        f.sub.toLowerCase().includes(q),
    );
  }
  return list;
}

export function getSubs(activeCat: string): string[] {
  const list =
    activeCat === "all"
      ? (F as unknown as Formula[])
      : (F as unknown as Formula[]).filter((f) => f.cat === activeCat);
  const seen: Record<string, number> = {};
  const subs: string[] = [];
  list.forEach((f) => {
    if (!seen[f.sub]) {
      seen[f.sub] = 1;
      subs.push(f.sub);
    }
  });
  return subs;
}
