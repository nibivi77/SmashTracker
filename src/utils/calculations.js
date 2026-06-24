export function calculateRatio(damageGiven, damageTaken) {
  return damageGiven / damageTaken;
}

export function getTeamRatio(record) {
  const dealt =
    Number(record.p1DamageGiven) + Number(record.p2DamageGiven);

  const taken =
    Number(record.p1DamageTaken) + Number(record.p2DamageTaken);

  return calculateRatio(dealt, taken);
}
