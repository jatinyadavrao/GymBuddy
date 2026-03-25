const toSet = (arr = []) => new Set(arr.map((v) => String(v).toLowerCase()));

export const calculateCompatibilityScore = (currentUser, candidate) => {
  let score = 0;
  const reasons = [];

  if (
    currentUser.gymLocation &&
    candidate.gymLocation &&
    currentUser.gymLocation.toLowerCase() === candidate.gymLocation.toLowerCase()
  ) {
    score += 30;
    reasons.push("Same gym location");
  }

  const goalOverlap = [...toSet(currentUser.fitnessGoals)].filter((g) =>
    toSet(candidate.fitnessGoals).has(g)
  );
  if (goalOverlap.length) {
    score += 20;
    reasons.push("Shared fitness goals");
  }

  const scheduleOverlap = [...toSet(currentUser.workoutSchedule)].filter((s) =>
    toSet(candidate.workoutSchedule).has(s)
  );
  if (scheduleOverlap.length) {
    score += 20;
    reasons.push("Compatible workout schedule");
  }

  const interestOverlap = [...toSet(currentUser.interests)].filter((i) =>
    toSet(candidate.interests).has(i)
  );
  if (interestOverlap.length) {
    score += 20;
    reasons.push("Shared interests");
  }

  if (currentUser.fitnessLevel && currentUser.fitnessLevel === candidate.fitnessLevel) {
    score += 10;
    reasons.push("Similar fitness level");
  }

  return { score, reasons };
};
