export function createDuoKey(p1Character, p2Character) {
  // Sort alphabetically so kirby_mario and mario_kirby become the same key
  const sorted = [p1Character, p2Character].sort();
  return `${sorted[0]}_${sorted[1]}`;
}
