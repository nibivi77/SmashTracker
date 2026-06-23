
export function calculateRatio(
  damageGiven,
  damageTaken
) {
  if (damageTaken === 0) {
    return Infinity;
  }

  return damageGiven / damageTaken;
}

export function getTeamRatio(record) {
  const dealt =
    record.p1DamageGiven +
    record.p2DamageGiven;

  const taken =
    record.p1DamageTaken +
    record.p2DamageTaken;

  return calculateRatio(dealt, taken);
}