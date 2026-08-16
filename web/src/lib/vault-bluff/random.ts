function hash32(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededUnit(seed: string, cursor: number): number {
  let value = hash32(`${seed}:${cursor}`);
  value += 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

export function seededPick<T>(values: readonly T[], seed: string, cursor: number): T {
  if (values.length === 0) throw new Error("Cannot pick from an empty list");
  return values[Math.floor(seededUnit(seed, cursor) * values.length)]!;
}
