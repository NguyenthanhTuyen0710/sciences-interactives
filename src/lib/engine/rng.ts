import type { Rng } from "./types";

/** Hachage FNV-1a d'une graine textuelle. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Générateur pseudo-aléatoire déterministe (mulberry32) : même graine → même exercice. */
export function createRng(seed: string): Rng {
  let a = hash(seed) || 1;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return {
    next,
    int,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => {
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    sign: () => (next() < 0.5 ? -1 : 1),
  };
}

export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Mélange une liste et renvoie aussi la permutation : shuffled[i] = items[perm[i]].
 * Utile pour mélanger des options tout en connaissant la position de la bonne réponse.
 */
export function shuffleWithIndex<T>(rng: Rng, items: readonly T[]) {
  const perm = rng.shuffle(items.map((_, i) => i));
  return { shuffled: perm.map((i) => items[i]), perm, indexOf: (orig: number) => perm.indexOf(orig) };
}
