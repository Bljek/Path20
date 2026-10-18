const CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

/** Roll20-style repeating row id: a leading "-" plus 19 base64-ish chars. Deterministic when `rand` is seeded. */
export function newRowId(rand: () => number = Math.random): string {
  let id = "-";
  for (let i = 0; i < 19; i++) id += CHARS[Math.floor(rand() * CHARS.length)];
  return id;
}

/** Small seeded PRNG (mulberry32) so tests and re-imports get stable ids. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
