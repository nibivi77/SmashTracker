export function calculateRatio(damageGiven, damageTaken) {
  return damageTaken > 0 ? damageGiven / damageTaken : Infinity;
}

export function getTeamTotals(record) {
  return {
    dealt: Number(record.p1DamageGiven) + Number(record.p2DamageGiven),
    taken: Number(record.p1DamageTaken) + Number(record.p2DamageTaken)
  };
}

export function getTeamRatio(record) {
  const { dealt, taken } = getTeamTotals(record);
  return calculateRatio(dealt, taken);
}

export function getPlayerRatio(damageGiven, damageTaken) {
  return calculateRatio(Number(damageGiven), Number(damageTaken));
}
