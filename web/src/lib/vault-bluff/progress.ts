export function nextRank(totalXp: number): {
  currentFloor: number;
  nextTarget: number;
  nextRank: string;
} {
  if (totalXp < 250) return { currentFloor: 0, nextTarget: 250, nextRank: "Bluffer" };
  if (totalXp < 800) return { currentFloor: 250, nextTarget: 800, nextRank: "Keykeeper" };
  if (totalXp < 2_000) return { currentFloor: 800, nextTarget: 2_000, nextRank: "Vaultmind" };
  return { currentFloor: 2_000, nextTarget: 2_000, nextRank: "Vaultmind" };
}
