import { getPlayerRatio } from "./calculations";

export function buildPerformanceEntry(record, playerSlot) {
  const isPlayer1 = playerSlot === "p1";

  const characterId = isPlayer1 ? record.p1Character : record.p2Character;
  const damageGiven = isPlayer1 ? Number(record.p1DamageGiven) : Number(record.p2DamageGiven);
  const damageTaken = isPlayer1 ? Number(record.p1DamageTaken) : Number(record.p2DamageTaken);
  const partnerCharacterId = isPlayer1 ? record.p2Character : record.p1Character;

  return {
    duoKey: record.duoKey,
    playerSlot,
    characterId,
    partnerCharacterId,
    damageGiven,
    damageTaken,
    ratio: getPlayerRatio(damageGiven, damageTaken),
    timestamp: record.timestamp ?? null
  };
}

export function getAllCharacterPerformances(records) {
  return records.flatMap((record) => [
    buildPerformanceEntry(record, "p1"),
    buildPerformanceEntry(record, "p2")
  ]);
}

export function getPlayer1Performances(records) {
  return records.map((record) => buildPerformanceEntry(record, "p1"));
}

export function getPlayer2Performances(records) {
  return records.map((record) => buildPerformanceEntry(record, "p2"));
}

export function sortPerformancesDesc(a, b) {
  if (b.ratio !== a.ratio) {
    return b.ratio - a.ratio;
  }

  if (b.damageGiven !== a.damageGiven) {
    return b.damageGiven - a.damageGiven;
  }

  const aTime = a.timestamp ?? 0;
  const bTime = b.timestamp ?? 0;

  return bTime - aTime;
}

function isPerformanceBetter(candidate, current) {
  return sortPerformancesDesc(candidate, current) < 0;
}

export function getBestPerformancePerCharacter(performances) {
  const bestByCharacter = new Map();

  for (const performance of performances) {
    const existing = bestByCharacter.get(performance.characterId);

    if (!existing || isPerformanceBetter(performance, existing)) {
      bestByCharacter.set(performance.characterId, performance);
    }
  }

  return Array.from(bestByCharacter.values()).sort(sortPerformancesDesc);
}

export function getPerformancesForCharacter(records, characterId) {
  return records
    .flatMap((record) => {
      const performances = [];

      if (record.p1Character === characterId) {
        performances.push(buildPerformanceEntry(record, "p1"));
      }

      if (record.p2Character === characterId) {
        performances.push(buildPerformanceEntry(record, "p2"));
      }

      return performances;
    })
    .sort(sortPerformancesDesc);
}
